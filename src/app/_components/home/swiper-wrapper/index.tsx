'use client';

import { type WorksList } from '@/app/_types';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { A11y, EffectCreative, Keyboard, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import './styles.scss';

interface SwiperWrapperProps {
  worksList: WorksList[];
}

const MouseStalker = dynamic(() => import('../mouse-stalker'), {
  ssr: false,
});

export const SwiperWrapper = ({ worksList }: SwiperWrapperProps) => {
  const swiperRef = useRef<SwiperType>(null);
  const [ready, setReady] = useState(false);

  /**
   * スライド番号の取得
   */
  const [slideIndex, setSlideIndex] = useState<number | undefined>();
  useEffect(() => {
    const savedIndex = sessionStorage.getItem('slideIndex');
    if (savedIndex === null) {
      setSlideIndex(0);
    } else {
      setSlideIndex(Number(savedIndex));
    }
  }, []);

  /**
   * ブラウザサイズの取得
   */
  const [browserWidth, setBrowserWidth] = useState(0);
  const [browserHeight, setBrowserHeight] = useState(0);
  useEffect(() => {
    const updateBrowser = () => {
      const vw = window.innerWidth;
      const vh = window.outerHeight;
      setBrowserWidth(vw);
      setBrowserHeight(vh);
    };

    updateBrowser();
    window.addEventListener('resize', updateBrowser);
    return () => window.removeEventListener('resize', updateBrowser);
  }, []);

  /**
   * 1番高いsummaryの高さを取得
   */
  const [maxSummaryHeight, setMaxSummaryHeight] = useState<number>(0);
  const summaryRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let lastHeight = 0;
    let stableCount = 0;
    let retries = 0;
    const maxRetries = 15; // 最大試行回数（約4〜5秒くらい）

    const checkSummaryHeight = () => {
      const heights = summaryRefs.current.map(element => Math.ceil(element?.getBoundingClientRect().height ?? 0));
      const maxHeight = Math.max(...heights);

      // 高さがほぼ変わらなければカウントを進める
      if (Math.abs(maxHeight - lastHeight) < 2) {
        stableCount++;
      } else {
        stableCount = 0;
        lastHeight = maxHeight;
      }

      // 2回連続で変化がなければ「確定」
      if (stableCount >= 2 || retries >= maxRetries) {
        setMaxSummaryHeight(maxHeight);
        return;
      }

      retries++;
      setTimeout(checkSummaryHeight, 300); // 0.3秒ごとに再確認
    };

    checkSummaryHeight();

    window.addEventListener('resize', checkSummaryHeight);
    return () => {
      window.removeEventListener('resize', checkSummaryHeight);
    };
  }, [worksList]);

  /**
   * リンク画像のサイズの取得
   */
  const [anchorSize, setAnchorSize] = useState({
    height: 0,
    width: 0,
  });
  const anchorRef = useRef<HTMLAnchorElement>(null);

  const updateAnchorSize = useCallback(() => {
    const { height, width } = anchorRef.current!.getBoundingClientRect();
    setAnchorSize({
      height: Math.ceil(height) + 20,
      width: Math.ceil(width) + 20,
    });
  }, []);

  useEffect(() => {
    if (!anchorRef.current) return;
    updateAnchorSize(); // 初回計測
    const observer = new ResizeObserver(updateAnchorSize); // anchorのサイズ変化を監視
    observer.observe(anchorRef.current);
    return () => observer.disconnect();
  }, [updateAnchorSize]);

  // maxSummaryHeight や ブラウザサイズ が変わった場合も再計測
  useEffect(() => {
    if (!anchorRef.current) return;
    updateAnchorSize();
  }, [maxSummaryHeight, updateAnchorSize, browserHeight, browserWidth]);

  /**
   * 円形運動
   */
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const degRef = useRef(-65); // スタート位置の角度
  const radiusRef = useRef(0); // 半径
  const frameId = useRef(0);
  const animatingRef = useRef(false);

  // 移動位置を計算
  // deg * Math.PI / 180 ⇒ deg（度数法）をラジアンに変換
  // cos(θ) * r ⇒ x座標
  // sin(θ) * r ⇒ y座標
  const updatePosition = useCallback((deg: number) => {
    if (!circleRef.current) return;
    const r = radiusRef.current;
    const x = Math.cos((deg * Math.PI) / 180) * r;
    const y = Math.sin((deg * Math.PI) / 180) * r;
    circleRef.current.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  // containerRef のサイズに応じて半径を計算
  const updateRadius = useCallback(() => {
    const rect = containerRef.current!.getBoundingClientRect();
    radiusRef.current = rect.width / 2; // 半径の更新
    updatePosition(degRef.current); // 円上での位置を更新
  }, [updatePosition]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!circleRef.current) return;
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, [updateRadius]);

  // anchorSizeが変わった場合も再計算
  useEffect(() => {
    if (!containerRef.current) return;
    if (!circleRef.current) return;
    updateRadius();
  }, [anchorSize.height, updateRadius]);

  // 1回転させる
  const handleRotate = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    circleRef.current?.classList.add('is_active');

    const startDeg = degRef.current;
    const targetDeg = startDeg - 360; // 移動量
    const duration = 2000; // スピード調整(ミリ秒)

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime; // 経過時間
      const progress = Math.min(elapsed / duration, 1); // 時間の進み具合 (0〜1)

      degRef.current = startDeg + (targetDeg - startDeg) * progress; // 進み具合から角度を算出
      updatePosition(degRef.current); // 位置を更新

      if (progress < 1) {
        frameId.current = requestAnimationFrame(animate);
      } else {
        degRef.current = targetDeg % 360; // 最終角度に正規化
        circleRef.current?.classList.remove('is_active');
        animatingRef.current = false;
      }
    };

    frameId.current = requestAnimationFrame(animate);
  }, [updatePosition]);

  // 描画位置をセット
  useEffect(() => {
    // anchorSizeの比率に応じて、角度の微調整
    const goldenRatio = 1.618;
    const getAdjustedDeg = () => {
      if (anchorSize.height === 0) return -65;

      const actualRatio = anchorSize.width / anchorSize.height;
      const diff = goldenRatio - actualRatio;
      const scale = 3; // 差に対して、どれくらい角度を減らすか

      if (diff <= 1) return -65;

      let adjusted = -65 - diff * scale;
      adjusted = Math.max(-85, Math.min(-65, adjusted)); // 範囲：-85 ～ -65
      return adjusted;
    };

    const adjusted = getAdjustedDeg();
    degRef.current = adjusted;
    updatePosition(adjusted);
  }, [anchorSize, updatePosition]);

  /**
   * ページネーション
   */
  const pagination = {
    clickable: true,
    renderBullet: function (index: number, className: string) {
      const pageNum = index + 1;
      return `
    <button
      class="${className}"
      type="button"
      aria-label="スライド ${pageNum}を表示">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="13.5" fill="none" stroke="#fff" stroke-width="1" />
      </svg>
      ${String(pageNum).padStart(2, '0')}
    </button>`;
    },
  };

  return (
    <div
      className="swiperWrapper"
      style={
        {
          '--anchor-height': anchorSize.height > 0 ? `${anchorSize.height}px` : undefined,
          '--anchor-width': anchorSize.width > 0 ? `${Math.ceil(anchorSize.width / 2)}px` : undefined,
          '--summary-height': maxSummaryHeight > 0 ? `${maxSummaryHeight}px` : undefined,
          '--summary-width':
            browserWidth > 0 ? `${Math.ceil(browserWidth / 2) - Math.ceil(anchorSize.width / 2)}px` : undefined,
        } as React.CSSProperties
      }
    >
      {ready && <MouseStalker ready={ready} />}
      {/* 次へボタン */}
      <button
        aria-label="次のスライドへ移動"
        className="nextButton"
        onClick={() => {
          swiperRef.current?.slideNext();
        }}
      >
        <span className="nextButton__inner">
          <svg height="85" viewBox="0 0 85 85" width="85" xmlns="http://www.w3.org/2000/svg">
            <circle cx="42.5" cy="42.5" fill="none" r="42" stroke="#fff" strokeWidth="1" />
          </svg>
          <Image alt="→" fetchPriority="high" height={21} src="/img/arrow.svg" width={38} />
        </span>
      </button>
      <Swiper
        a11y={{
          containerMessage: 'ポートフォリオ一覧のカルーセル、スライドで作品を切り替えられます',
          containerRole: 'region',
          containerRoleDescriptionMessage: 'カルーセル',
          enabled: true,
          paginationBulletMessage: 'スライド {{index}}を表示',
        }}
        breakpoints={{
          769: {
            slidesPerView: 1.75,
          },
          1025: {
            slidesPerView: 2,
          },
        }}
        centeredSlides={true}
        creativeEffect={{
          limitProgress: 2,
          next: {
            translate: ['100%', 0, 0],
          },
          prev: {
            opacity: 0,
            translate: ['-100%', 0, 0],
          },
        }}
        effect={'creative'}
        initialSlide={slideIndex}
        key={slideIndex}
        keyboard={{ enabled: true }}
        loop={true}
        modules={[Pagination, EffectCreative, Keyboard, A11y]}
        onInit={swiper => {
          for (const [index, slide] of swiper.slides.entries()) {
            if (index === swiper.activeIndex) {
              slide.removeAttribute('inert');
              for (const el of slide.querySelectorAll<HTMLElement>('a, button, input, textarea, select, [tabindex]')) {
                el.removeAttribute('tabindex');
              }
            } else {
              slide.setAttribute('inert', '');
              for (const el of slide.querySelectorAll<HTMLElement>('a, button, input, textarea, select, [tabindex]')) {
                el.setAttribute('tabindex', '-1');
              }
            }
          }
          setTimeout(() => {
            setReady(true);
          }, 1000);
        }}
        onSlideChangeTransitionEnd={swiper => {
          for (const [index, slide] of swiper.slides.entries()) {
            if (index === swiper.activeIndex) {
              // アクティブスライド
              slide.removeAttribute('inert');
              slide.setAttribute('aria-current', 'true');
              for (const el of slide.querySelectorAll<HTMLElement>('a, button, input, textarea, select, [tabindex]'))
                el.removeAttribute('tabindex');
            } else {
              // 非アクティブスライド
              slide.setAttribute('inert', '');
              slide.removeAttribute('aria-current');
              for (const el of slide.querySelectorAll<HTMLElement>('a, button, input, textarea, select, [tabindex]'))
                el.setAttribute('tabindex', '-1');
            }
          }
        }}
        onSlideChangeTransitionStart={swiper => {
          if (!animatingRef.current) handleRotate();
          if (circleRef.current) circleRef.current.dataset.slide = String(swiper.realIndex);
        }}
        onSwiper={swiper => (swiperRef.current = swiper)}
        pagination={pagination}
        slidesPerView={1}
        speed={2000}
      >
        {worksList.map((item, index) => (
          <SwiperSlide key={`works-${item.id}`}>
            <article>
              <div
                className="summary"
                ref={element => {
                  // eslint-disable-next-line security/detect-object-injection
                  summaryRefs.current[index] = element;
                }}
              >
                <header className="summary__header">
                  <h2 className="summary__header__title">
                    <span className="summary__header__title__number textMask">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    </span>
                    <span className="textMask textMask--half">
                      <span>{item.title}</span>
                    </span>
                  </h2>
                  <dl>
                    <div className="textMask">
                      <dt className="u-screenReader">プロジェクトの種類</dt>
                      <dd>{item.category[0]}</dd>
                    </div>
                    <div className="textMask">
                      <dt className="u-screenReader">サイトの形態</dt>
                      <dd>{item.siteType}</dd>
                    </div>
                  </dl>
                </header>
                <ul aria-label="担当箇所" className="summary__list">
                  {item.part.map((partItem, index) => {
                    return (
                      <li className="textMask" key={`works-${item.id}-${index}`}>
                        <span>{partItem}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="summary__text textMask textMask--half">
                  <span>{item.text}</span>
                </p>
              </div>
              <Link
                aria-label={`${item.title}の詳細を見る`}
                href={`/works/${item.id}`}
                ref={index === 0 ? anchorRef : undefined}
              >
                <svg
                  className={clsx(ready && 'is_show')}
                  height={anchorSize.height}
                  viewBox={`0 0 ${anchorSize.width} ${anchorSize.height}`}
                  width={anchorSize.width}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1"
                    style={
                      {
                        '--rect-length': `${Math.ceil(anchorSize.width + anchorSize.height - 2 * (Math.min(anchorSize.width, anchorSize.height) / 2) + 2 * Math.PI * (Math.min(anchorSize.width, anchorSize.height) / 2))}px`,
                      } as React.CSSProperties
                    }
                  >
                    <rect
                      className="stroke1"
                      fill="none"
                      height={anchorSize.height}
                      rx={Math.min(anchorSize.width, anchorSize.height) / 2}
                      width={anchorSize.width}
                      x="0.5"
                      y="0.5"
                    />
                    <rect
                      className="stroke2"
                      fill="none"
                      height={anchorSize.height}
                      rx={Math.min(anchorSize.width, anchorSize.height) / 2}
                      width={anchorSize.width}
                      x="0.5"
                      y="0.5"
                    />
                  </g>
                </svg>
                <div className={clsx('imageMask', ready && 'is_show')} data-slide={index}>
                  <Image
                    alt={item.thumbnail.alt}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    height={item.thumbnail.height}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    priority={index === 0 ? true : false}
                    sizes="(max-width: 768px) 120vw, (max-width: 1280px) 75vw, 1500px"
                    src={item.thumbnail.url}
                    width={item.thumbnail.width}
                  />
                </div>
              </Link>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* 円形運動 */}
      <div className={clsx('circular', ready && 'is_show')}>
        <div className="circular__motion" ref={containerRef}>
          <div className="circular__motion__position">
            <div className="circular__motion__circle" ref={circleRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
