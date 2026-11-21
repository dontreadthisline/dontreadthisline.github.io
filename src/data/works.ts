// 作品索引数据。
// 站内作品页：在 src/pages/works/<slug>/ 手写页面，href 填 /works/<slug>/
// 外部作品（如部署在别的仓库 Pages 的项目页）：href 直接填外链。
export interface Work {
  title: string;
  tagline: string;
  lang: string;
  lines: string;
  status: '写着呢' | '读完了' | '弃坑';
  date: string;
  repo?: string;
  href: string;
}

export const works: Work[] = [
  {
    title: 'tinyautograd',
    tagline: 'MLX 之上约六百行 Python 的自动微分框架，配一本自包含的设计之书',
    lang: 'Python',
    lines: '~600 行',
    status: '读完了',
    date: '2026',
    repo: 'https://github.com/dontreadthisline/tinyautograd',
    href: 'https://dontreadthisline.github.io/tinyautograd/',
  },
];
