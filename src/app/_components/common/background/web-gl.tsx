'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './background.module.scss';

export default function WebGl() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    let renderer: THREE.WebGLRenderer; // WebGL描画
    let manager: THREE.LoadingManager; // テクスチャのロード管理
    let pixelRatio = 1; // デバイスピクセル比
    let width = 0;
    let height = 0;
    let ready = false;

    // シーン構成要素
    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let stage: THREE.Group;

    // 描画用の平面（背景画像＋ノイズエフェクト）
    const plane: {
      geometry?: THREE.PlaneGeometry;
      material?: THREE.ShaderMaterial;
      mesh?: THREE.Mesh;
      src?: string;
      texture?: THREE.Texture;
    } = {
      geometry: undefined,
      material: undefined,
      mesh: undefined,
      src: '/img/bg.jpg',
      texture: undefined,
    };

    /**
     * 1. 平面とシェーダーの生成
     */
    // Description : Array and textureless GLSL 2D/3D/4D simplex
    //               noise functions.
    //      Author : Ian McEwan, Ashima Arts.
    //  Maintainer : stegu
    //     Lastmod : 20201014 (stegu)
    //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
    //               Distributed under the MIT License. See LICENSE file.
    //               https://github.com/ashima/webgl-noise
    //               https://github.com/stegu/webgl-noise
    const addPlane = () => {
      plane.geometry = new THREE.PlaneGeometry(1, 1, 1, 1); // 幅1×高さ1の平面を作成

      // シェーダー（ノイズ＋歪みエフェクト）
      plane.material = new THREE.ShaderMaterial({
        // Fragment Shader (ピクセルごとの色計算)
        fragmentShader: `
      // --- ノイズ生成 ---
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      // 3次元 Simplex Noise の本体関数
      float simplexNoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
          i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
          i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

        vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 85.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      // --- シェーダーメイン部分 ---
      uniform sampler2D tDiffuse; // 入力テクスチャ（背景画像）
      varying vec2 vUv;           // ピクセル位置のUV座標
      uniform float time;         // 経過時間
      uniform float width;        // ノイズ空間のXスケール
      uniform float height;       // ノイズ空間のYスケール
      uniform float speed;        // 動く速さ

      void main() {
        // 時間と座標からノイズ値を生成
        float n = simplexNoise(vec3(vUv.x * width, vUv.y * height, time * speed * 0.01));
        // UV座標をノイズ値でずらす（歪みエフェクト）
        // vec2(0.5 * n)：ノイズ強度を調整、ずらしたUVからテクスチャ色を取得して描画
        gl_FragColor = texture2D(tDiffuse, vUv + vec2(0.5 * n));
      }
      `,
        // 両面描画・透明許可
        side: THREE.DoubleSide,
        transparent: true,
        uniforms: {
          // シェーダー内で使うパラメータを初期化
          height: { value: 1 },
          resolution: { value: new THREE.Vector2(width * pixelRatio, height * pixelRatio) },
          speed: { value: 0.1 },
          tDiffuse: { value: plane.texture },
          time: { value: 0 },
          width: { value: 1 },
        },
        // Vertex Shader（頂点変換）
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv; // 頂点のUVをそのままフラグメントへ渡す
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition; // カメラ座標に変換
        }
      `,
      });

      // 平面メッシュを作成し、ステージに追加
      plane.mesh = new THREE.Mesh(plane.geometry, plane.material);
      plane.mesh.scale.set(width, height, 1); // 画面サイズに合わせて拡大
      stage?.add(plane.mesh);
    };

    /**
     * 2. シーン初期化
     */
    const initScene = () => {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xff_ff_ff);

      // 正射影カメラ（遠近感のない平面投影）
      camera = new THREE.OrthographicCamera(-width / 4, width / 4, height / 4, -height / 4, 0, 1000);

      stage = new THREE.Group();
      scene.add(camera);
      scene.add(stage);

      // 平面を追加して最初の描画
      addPlane();
      renderer.render(scene, camera);
    };

    /**
     * 3. 毎フレームの更新処理
     */
    const updateScene = () => {
      if (plane.material) {
        plane.material.uniforms.time.value += 0.5; // timeを加算してノイズを動かす
      }
    };

    const animate = () => {
      if (ready && scene && camera && stage && renderer) {
        updateScene();
        renderer.render(scene, camera); // 再描画
        requestAnimationFrame(animate); // ループ
      }
    };

    /**
     * 4. WebGLレンダラー初期化
     */
    const initWebGL = (canvas: HTMLCanvasElement) => {
      width = window.innerWidth;
      height = window.outerHeight;
      pixelRatio = Math.min(window.devicePixelRatio, 1.2);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
      });
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height);

      // ローディング完了時にinitScene()を実行
      manager = new THREE.LoadingManager();
      manager.onLoad = () => {
        initScene();
        ready = true;
        animate();
        setLoad(true);
      };
    };

    /**
     * 5. テクスチャ読み込み
     */
    const loadAssets = () => {
      const textureLoader = new THREE.TextureLoader(manager!);
      textureLoader.crossOrigin = 'anonymous';

      // 背景画像を読み込み、plane.textureにセット
      textureLoader.load(plane.src!, texture => {
        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        plane.texture = texture;
      });
    };

    /**
     * 6. ウィンドウリサイズ対応
     */
    const resizeWebGL = () => {
      width = window.innerWidth;
      height = window.outerHeight;
      renderer?.setSize(width, height);
    };

    /**
     * 7. 実行フロー開始
     */
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    initWebGL(canvas); // WebGLの初期化
    loadAssets(); // 画像ロード開始
    window.addEventListener('resize', resizeWebGL);

    return () => {
      window.removeEventListener('resize', resizeWebGL);
    };
  }, []);

  return <canvas className={clsx(styles.canvas, load && styles.is_load)} ref={canvasRef} />;
}
