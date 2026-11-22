// 站点身份与导航配置。
// 加导航项就往 NAV 里添一条：label 显示中文，hand 是手写体小注，icon 对应 Base.astro 里的徽记图。
export const SITE_NAME = 'aha<b>room</b>';
export const SITE_TITLE = 'aha room';

export interface NavLink {
  href: string;
  label: string;
  hand?: string;
  icon: 'cabinet' | 'journal' | 'peak' | 'book';
}

export const NAV: NavLink[] = [
  { href: '/works/', label: '作品', hand: 'cabinet', icon: 'cabinet' },
  { href: '/notes/', label: '笔记', hand: 'journal', icon: 'journal' },
  { href: '/about/', label: '关于', hand: 'about', icon: 'peak' },
];
