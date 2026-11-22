// aha room：顿悟摘录。从笔记里挑值得挂出来的"啊哈时刻"。
// 挂首页用，新笔记写完顺手来加一条。
export interface Aha {
  text: string;
  from: string;   // 出处（笔记标题）
  href: string;   // 笔记链接
  date: string;
}

export const ahas: Aha[] = [
  {
    text: '新状态永远只通过 ε 边参与游戏 —— 归纳构造时每个 case 都不需要碰子机器的内部。这就是 Thompson 构造"可教"的原因。',
    from: 'Thompson 构造笔记',
    href: '/notes/thompson-nfa/',
    date: '11.19',
  },
  {
    text: '队列和集合合一，seen 既是结果又是去重器 —— 回环图在这里自然终止，不需要另外的退出条件。',
    from: 'Thompson 构造笔记',
    href: '/notes/thompson-nfa/',
    date: '11.19',
  },
];
