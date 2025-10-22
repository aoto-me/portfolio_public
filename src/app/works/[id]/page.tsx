import { PageTransition } from '@/app/_components/common';
import { Accordion, CutCorner, DecorativeBorder, FixedHeader, Header, SaveIndex } from '@/app/_components/works';
import { getPostById, getPosts } from '@/app/_libs';
import { client } from '@/app/_libs/microcms';
import clsx from 'clsx';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type BreadcrumbList, type CreativeWork, type WithContext } from 'schema-dts';
import styles from './page.module.scss';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const { id } = await params;
  const post = await getPostById(id).catch(notFound);
  const url = `${baseUrl}/works/${post.id}`;

  return {
    alternates: {
      canonical: url,
    },
    description: post.text,
    openGraph: {
      description: post.text,
      images: ['/ogp.jpg'],
      locale: 'ja_JP',
      siteName: 'Portfolio - ○○○○',
      title: post.title,
      type: 'article',
      url: url,
    },
    title: post.title,
  };
}

// 静的パスを生成
export async function generateStaticParams() {
  const contentIds = await client.getAllContentIds({ endpoint: 'works' });

  return contentIds.map(contentId => ({
    id: contentId, // 各記事のIDをパラメータとして返す
  }));
}

// 記事詳細ページの生成
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // IDを取得
  const works = await getPostById(id).catch(notFound);
  const allPosts = await getPosts();
  const url = process.env.NEXT_PUBLIC_URL;

  // 記事番号を取得
  const index = allPosts.findIndex(p => p.id === id);
  const next = index === 6 ? allPosts[0] : allPosts[index + 1];
  const prev = index === 0 ? allPosts[6] : allPosts[index - 1];

  const jsonLd: WithContext<CreativeWork> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    author: {
      '@type': 'Person',
      name: '○○○○',
    },
    dateModified: works.updatedAt,
    description: works.text,
    genre: 'Web design',
    inLanguage: 'ja',
    keywords: [works.siteType],
    name: works.title,
    thumbnailUrl: works.thumbnail.url,
    url: `${url}/works/${works.id}`,
  };

  const breadcrumbJsonLd: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem' as const,
        item: `${url}/`,
        name: 'Portfolio - ○○○○',
        position: 1,
      },
      {
        '@type': 'ListItem' as const,
        item: `${url}/works/${works.id}`,
        name: works.title,
        position: 2,
      },
    ],
  };

  return (
    <PageTransition name="post-transition">
      <div className={`${styles.page} page`} data-page="works">
        <div className={`${styles.page__inner} postFadeIn page__inner`}>
          <SaveIndex index={index} />
          <div className={clsx(styles.frame, styles['frame--left-top'])}></div>
          <div className={clsx(styles.frame, styles['frame--left-bottom'])}></div>
          <div className={clsx(styles.frame, styles['frame--right-top'])}></div>
          <div className={clsx(styles.frame, styles['frame--right-bottom'])}></div>
          <Header />
          <FixedHeader />
          <main>
            <article className={styles.article}>
              <header className={styles.header}>
                <h1 className={styles.header__title}>
                  <span className={styles.header__title__number}>{String(index + 1).padStart(2, '0')}</span>
                  {works.title}
                </h1>
                <dl>
                  <dt className="u-screenReader">プロジェクトの種類</dt>
                  <dd>{works.category[0]}</dd>
                  <dt className="u-screenReader">サイトの形態</dt>
                  <dd>{works.siteType}</dd>
                </dl>
              </header>
              <div className={styles.summary}>
                <h2 className="u-screenReader">サイト概要</h2>
                <div>
                  <dl className={styles.summary__dl}>
                    <div>
                      <dt>担当</dt>
                      <dd>
                        {works.part.map((item, index) => {
                          return <span key={`works-part-${index}`}>{item}</span>;
                        })}
                      </dd>
                    </div>

                    <div>
                      <dt>URL</dt>
                      <dd>
                        <a
                          aria-label={`${works.title}を新しいウィンドウで開く`}
                          href={works.url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {works.url}
                        </a>
                        {works.id === 'schedule-app' && (
                          <dl aria-label="テスト用アカウント">
                            <div>
                              <dt>UserName</dt>
                              <dd>test</dd>
                            </div>
                            <div>
                              <dt>Password</dt>
                              <dd>test</dd>
                            </div>
                          </dl>
                        )}
                      </dd>
                    </div>

                    {works.github && (
                      <div>
                        <dt>GitHub</dt>
                        <dd>
                          <a
                            aria-label={`${works.title}のGitHubのリポジトリを新しいウィンドウで開く`}
                            href={works.github}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {works.github}
                          </a>
                        </dd>
                      </div>
                    )}

                    <div>
                      <dt>制作年度</dt>
                      <dd>{works.year}</dd>
                    </div>

                    {works.cms.length > 0 && (
                      <div>
                        <dt>CMS</dt>
                        <dd>
                          {works.cms.map((item, index) => {
                            return <span key={`works-cms-${index}`}>{item}</span>;
                          })}
                        </dd>
                      </div>
                    )}

                    {works.db.length > 0 && (
                      <div>
                        <dt>DB</dt>
                        <dd>
                          {works.db.map((item, index) => {
                            return <span key={`works-db-${index}`}>{item}</span>;
                          })}
                        </dd>
                      </div>
                    )}

                    <div>
                      <dt>言語・開発環境</dt>
                      <dd>
                        {works.language.map((item, index) => {
                          return <span key={`works-language-${index}`}>{item}</span>;
                        })}
                      </dd>
                    </div>

                    <div>
                      <dt>アプリケーション</dt>
                      <dd>
                        {works.tool.map((item, index) => {
                          return <span key={`works-tool-${index}`}>{item}</span>;
                        })}
                      </dd>
                    </div>
                  </dl>

                  <p className={styles.summary__text}>{works.text}</p>
                </div>
                <div className={styles.summary__img}>
                  <Image
                    alt=""
                    height={works.frontImage.height}
                    loading={'eager'}
                    src={works.frontImage.url}
                    width={works.frontImage.width}
                  />
                </div>
              </div>
              {works.problem && works.solution && (
                <CutCorner>
                  <h2 className="u-screenReader">サイトの課題と解決</h2>
                  <div className={clsx(styles.case, styles['case--problem'])}>
                    <h3>課題</h3>
                    <ul>
                      {works.problem
                        .split('\n')
                        .filter(line => line.trim() !== '')
                        .map((line, index) => (
                          <li key={`${works.id}-problem-${index}`}>{line}</li>
                        ))}
                    </ul>
                  </div>
                  <div className={clsx(styles.case, styles['case--solution'])}>
                    <h3>解決</h3>
                    <ul>
                      {works.solution
                        .split('\n')
                        .filter(line => line.trim() !== '')
                        .map((line, index) => (
                          <li key={`${works.id}-solution-${index}`}>{line}</li>
                        ))}
                    </ul>
                  </div>
                </CutCorner>
              )}

              {(works.id === 'portfolio' || works.id === 'schedule-app') && (
                <CutCorner>
                  <h2 className="u-screenReader">サイト制作にあたっての目標</h2>
                  <div className={clsx(styles.case, styles['case--solution'])}>
                    <h3>目標</h3>
                    <ul>
                      {works.solution
                        .split('\n')
                        .filter(line => line.trim() !== '')
                        .map((line, index) => (
                          <li key={`${works.id}-solution-${index}`}>{line}</li>
                        ))}
                    </ul>
                  </div>
                </CutCorner>
              )}

              <DecorativeBorder />
              {works.siteImage.map((image, index) => {
                return (
                  <Image
                    alt={image.alt}
                    className={styles.siteImage}
                    height={image.height}
                    key={`${works.id}-image-${index}`}
                    src={image.url}
                    width={image.width}
                  />
                );
              })}
              {works.detail.map((item, index) => {
                return (
                  <div className={styles.detail} key={`${works.id}-detail-${index}`}>
                    <h2>{item.heading}</h2>
                    {item.images.map((image, index) => {
                      return (
                        <figure key={`${works.id}-figure-${index}`}>
                          <Image
                            alt={image.alt.split('　')[0]}
                            height={image.height}
                            src={image.url}
                            width={image.width}
                          />
                          <figcaption>{image.alt.split('　')[1]}</figcaption>
                        </figure>
                      );
                    })}
                    {item.text
                      .split('\n')
                      .filter(line => line.trim() !== '')
                      .map((line, index) => (
                        <p key={`${works.id}-detail-text-${index}`}>{line}</p>
                      ))}
                    {works.id === 'schedule-app' && index === 0 && (
                      <section>
                        <h3>主な機能</h3>
                        <ul>
                          <li>JWTによる認証ログイン</li>
                          <li>カレンダー機能（祝日・ToDo・収支・体調・食事記録・日記など登録データの表示）</li>
                          <li>タスク管理（ToDo登録とスケジュールのグラフ化）</li>
                          <li>家計簿（収入・支出の登録とグラフ化）</li>
                          <li>健康管理（体調・食事記録とグラフ化）</li>
                          <li>Markdown対応の高機能エディター</li>
                          <li>カンバンボード（ToDoの分類）</li>
                          <li>テーブル機能（CSVエクスポート・Excelインポート対応）</li>
                          <li>ファイル管理（アップロード・ZIPダウンロード）</li>
                          <li>ギャラリー・日記（画像・動画整理、日記の登録）</li>
                          <li>Web情報収集（RSSフィード取得）</li>
                        </ul>
                      </section>
                    )}
                    {works.id === 'schedule-app' && index === 2 && (
                      <section>
                        <h3>具体的な対応</h3>
                        <ul>
                          <li>IPA「安全なウェブサイトの作り方」の推奨事項に準拠</li>
                          <li>データ取得・変更時は毎回JWTとセッションを検証</li>
                          <li>パスワードをハッシュ化して管理</li>
                          <li>初回ログインのデバイスの場合、ユーザーに確認メールを送信</li>
                          <li>5回連続でログインに失敗したIPからのログインをロック</li>
                          <li>
                            .htaccessによるサーバー側のアクセス制御（CSP・HSTS・X-Frame-Options などのヘッダー設定）
                          </li>
                          <li>アップロードファイルへの直接アクセスを禁止し、PHP経由での取得に限定</li>
                        </ul>
                      </section>
                    )}
                    {works.id === 'portfolio' && index === 1 && (
                      <Accordion title="自己チェック結果（WCAG 2.0 レベルAA）">
                        <div className={styles.tableWrap}>
                          <table>
                            <thead>
                              <tr>
                                <th>No.</th>
                                <th>達成基準</th>
                                <th>適合レベル</th>
                                <th>適用</th>
                                <th>備考</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th>1.1.1</th>
                                <td>非テキストコンテンツ</td>
                                <td>A</td>
                                <td>○</td>
                                <td>適宜画像に代替えテキストを設定</td>
                              </tr>
                              <tr>
                                <th>1.2.1</th>
                                <td>音声だけ及び映像だけ（収録済み）</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>1.2.2</th>
                                <td>キャプション（収録済み）</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>1.2.3</th>
                                <td>音声解説又はメディアに対する代替コンテンツ（収録済み）</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>1.2.4</th>
                                <td>キャプション（ライブ）</td>
                                <td>AA</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>1.2.5</th>
                                <td>音声解説（収録済み）</td>
                                <td>AA</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>1.3.1</th>
                                <td>情報及び関係性</td>
                                <td>A</td>
                                <td>○</td>
                                <td>
                                  セマンティックな要素で情報・関係を表現。NVDA（PC）とVoiceOver（スマホ）で読み上げ確認済み
                                </td>
                              </tr>
                              <tr>
                                <th>1.3.2</th>
                                <td>意味のある順序</td>
                                <td>A</td>
                                <td>○</td>
                                <td>HTMLの順序が意味的に自然。NVDA（PC）とVoiceOver（スマホ）で読み上げ順を確認済み</td>
                              </tr>
                              <tr>
                                <th>1.3.3</th>
                                <td>感覚的な特徴</td>
                                <td>A</td>
                                <td>○</td>
                                <td>色や位置のみに依存した説明なし</td>
                              </tr>
                              <tr>
                                <th>1.4.1</th>
                                <td>色の使用</td>
                                <td>A</td>
                                <td>○</td>
                                <td>色に依存した情報伝達なし</td>
                              </tr>
                              <tr>
                                <th>1.4.2</th>
                                <td>音声の制御</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>1.4.3</th>
                                <td>コントラスト（最低限レベル）</td>
                                <td>AA</td>
                                <td>○</td>
                                <td>TOPページのコントラスト比（11.9:1）、下層ページのコントラスト比（11.47:1）</td>
                              </tr>
                              <tr>
                                <th>1.4.4</th>
                                <td>テキストのサイズ変更</td>
                                <td>AA</td>
                                <td>○</td>
                                <td>PCはChromeとEdge、スマホはSafariで200%表示で情報欠落なしを確認</td>
                              </tr>
                              <tr>
                                <th>1.4.5</th>
                                <td>文字画像</td>
                                <td>AA</td>
                                <td>○</td>
                                <td>ロゴ・背景装飾のみで、情報としての文字画像の使用なし</td>
                              </tr>
                              <tr>
                                <th>2.1.1</th>
                                <td>キーボード操作</td>
                                <td>A</td>
                                <td>○</td>
                                <td>キーボード操作可能</td>
                              </tr>
                              <tr>
                                <th>2.1.2</th>
                                <td>キーボードトラップなし</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>2.2.1</th>
                                <td>タイミング調整可能</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>2.2.2</th>
                                <td>一時停止，停止及び非表示</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>2.3.1</th>
                                <td>3回のせん（閃）光，又はしきい（閾）値以下</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>2.4.1</th>
                                <td>ブロックスキップ</td>
                                <td>A</td>
                                <td>○</td>
                                <td>NVDAで目的のコンテンツへの移動を確認</td>
                              </tr>
                              <tr>
                                <th>2.4.2</th>
                                <td>ページタイトル</td>
                                <td>A</td>
                                <td>○</td>
                                <td>ページタイトルが内容を具体的に示している</td>
                              </tr>
                              <tr>
                                <th>2.4.3</th>
                                <td>フォーカス順序</td>
                                <td>A</td>
                                <td>○</td>
                                <td>適切な順序でフォーカスされる</td>
                              </tr>
                              <tr>
                                <th>2.4.4</th>
                                <td>リンクの目的（コンテキスト内）</td>
                                <td>A</td>
                                <td>○</td>
                                <td>リンク先が明確。適宜aria-labelで補完</td>
                              </tr>
                              <tr>
                                <th>2.4.5</th>
                                <td>複数の手段</td>
                                <td>AA</td>
                                <td>○</td>
                                <td>TOPページから全下層ページに、下層ページから前後ページやTOPに移動可能</td>
                              </tr>
                              <tr>
                                <th>2.4.6</th>
                                <td>見出し及びラベル</td>
                                <td>AA</td>
                                <td>○</td>
                                <td>見出しが内容を的確に示している</td>
                              </tr>
                              <tr>
                                <th>2.4.7</th>
                                <td>フォーカスの可視化</td>
                                <td>AA</td>
                                <td>○</td>
                                <td>フォーカスインジケーターが表示</td>
                              </tr>
                              <tr>
                                <th>3.1.1</th>
                                <td>ページの言語</td>
                                <td>A</td>
                                <td>○</td>
                                <td>HTMLのlang属性を設定</td>
                              </tr>
                              <tr>
                                <th>3.1.2</th>
                                <td>一部分の言語</td>
                                <td>AA</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>3.2.1</th>
                                <td>フォーカス時</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>3.2.2</th>
                                <td>入力時</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>3.2.3</th>
                                <td>一貫したナビゲーション</td>
                                <td>AA</td>
                                <td>○</td>
                                <td>スライド順と下層ページの前後関係が一貫</td>
                              </tr>
                              <tr>
                                <th>3.2.4</th>
                                <td>一貫した識別性</td>
                                <td>AA</td>
                                <td>○</td>
                                <td>下層ページは共通レイアウトのため操作・要素が一貫</td>
                              </tr>
                              <tr>
                                <th>3.3.1</th>
                                <td>エラーの特定</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>3.3.2</th>
                                <td>ラベル又は説明</td>
                                <td>A</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>3.3.3</th>
                                <td>エラー修正の提案</td>
                                <td>AA</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>3.3.4</th>
                                <td>エラー回避（法的，金融及びデータ）</td>
                                <td>AA</td>
                                <td>-</td>
                                <td>該当コンテンツなし</td>
                              </tr>
                              <tr>
                                <th>4.1.1</th>
                                <td>構文解析</td>
                                <td>A</td>
                                <td>○</td>
                                <td>HTML文法チェック済み（Next.jsよって生成されたタグの属性などは評価対象外）</td>
                              </tr>
                              <tr>
                                <th>4.1.2</th>
                                <td>名前（name），役割（role）及び値（value）</td>
                                <td>A</td>
                                <td>○</td>
                                <td>カルーセルに必要なWAI-ARIA属性を設定</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </Accordion>
                    )}
                    {works.id === 'portfolio' && index === 2 && (
                      <section>
                        <h3>具体的な対応</h3>
                        <ul>
                          <li>セマンティックなHTMLコーディング</li>
                          <li>Google PageSpeed InsightsにおけるSEOスコア100</li>
                          <li>構造化データ（JSON-LD）の利用</li>
                          <li>OGPの設定</li>
                          <li>robots.txtの設置</li>
                          <li>sitemap.xmlの設置</li>
                        </ul>
                      </section>
                    )}
                  </div>
                );
              })}
            </article>
            <DecorativeBorder margin="5rem" />
            <nav className={styles.nav}>
              <div className={styles.nav__arrows}>
                <Link aria-label={`前の作品（${prev.title}）の詳細へ`} href={`/works/${prev.id}`}>
                  <span className={clsx(styles.nav__arrows__arrow, styles['nav__arrows__arrow--prev'])}>
                    <svg height="60" viewBox="0 0 60 60" width="60" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="30" cy="30" fill="none" r="29.5" stroke="#333" strokeWidth="1" />
                    </svg>
                    <Image alt="←" fetchPriority="high" height={21} src="/img/arrow_black.svg" width={38} />
                  </span>
                  <span className={styles.nav__arrows__text}>Prev</span>
                </Link>
                <Link aria-label={`次の作品（${next.title}）の詳細へ`} href={`/works/${next.id}`}>
                  <span className={clsx(styles.nav__arrows__arrow, styles['nav__arrows__arrow--next'])}>
                    <svg height="60" viewBox="0 0 60 60" width="60" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="30" cy="30" fill="none" r="29.5" stroke="#333" strokeWidth="1" />
                    </svg>
                    <Image alt="→" fetchPriority="high" height={21} src="/img/arrow_black.svg" width={38} />
                  </span>
                  <span className={styles.nav__arrows__text}>Next</span>
                </Link>
              </div>
              <Link className={styles.nav__button} href="/">
                <span className={styles.nav__button__bg}></span>
                <span className={styles.nav__button__text}>一覧へ戻る</span>
              </Link>
            </nav>
          </main>
          <footer className={styles.footer}>
            <small>© 2025 ○○○○</small>
          </footer>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replaceAll('<', String.raw`\u003c`),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replaceAll('<', String.raw`\u003c`),
        }}
        type="application/ld+json"
      />
    </PageTransition>
  );
}
