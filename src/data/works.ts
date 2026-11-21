// 作品索引数据。作品页本身是手写的（src/pages/works/<slug>/index.astro），
// 这里只登记目录卡片要显示的元信息。
export interface Work {
  slug: string;
  title: string;
  tagline: string;
  lang: string;
  lines: string;
  status: '写着呢' | '读完了' | '弃坑';
  date: string;
  repo?: string;
}

export const works: Work[] = [
  {
    slug: 'tinyregex',
    title: 'tinyregex',
    tagline: '三百行写一个正则引擎，顺便把 Thompson 构造啃下来',
    lang: 'Python',
    lines: '~300 行',
    status: '写着呢',
    date: '2026.11',
    // repo: 'https://github.com/yourname/tinyregex',
  },
];
