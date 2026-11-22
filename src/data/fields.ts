// 三领域：聚合入口。书/长项目的实体住在各自独立仓库，
// 这里只登记条目和链接。没有实体的条目不编链接，落地页上诚实标"在攒"。
export interface FieldBook {
  title: string;
  tagline: string;
  href?: string;      // 独立仓库的项目页；没有则渲染为"在攒"
  date: string;
}

export interface Field {
  key: 'math' | 'physics' | 'code' | (string & {});
  name: string;
  hand: string;       // 手写体英文小标
  motto: string;      // 领域一句话
  now: string;        // 现在在学什么（落地页手写便签）
  books: FieldBook[];
  emblem?: 'riemann' | 'nabla' | 'graph';   // 落地页徽记；不配则回退为手绘书
}

export const fields: Field[] = [
  {
    key: 'math',
    name: '数学',
    hand: 'math —',
    motto: '给工程问题找数学的根。',
    now: '在攒：矩阵微分的笔记快能成章。',
    emblem: 'riemann',
    books: [
      {
        title: '微积分的物理地图',
        tagline: '为经典力学与电动力学重学微积分：两个母动作、一座桥、坐标无关性 —— 只重建翻译能力，不训练计算肌肉',
        href: 'https://dontreadthisline.github.io/calculus_for_phiysics/',
        date: '2026',
      },
      {
        title: '矩阵微分',
        tagline: '从标量求导到矩阵求导，形状不骗人',
        date: '计划中',
      },
      {
        title: 'Little Math for RL',
        tagline: '强化学习刚好够用的那部分数学',
        date: '计划中',
      },
    ],
  },
  {
    key: 'physics',
    name: '物理',
    hand: 'physics —',
    motto: '重学一遍，这次按朗道的顺序。',
    now: '在挑第一块硬骨头：从 nabla 算子开始。',
    emblem: 'nabla',
    books: [
      {
        title: 'nabla 算子的深刻理解',
        tagline: '梯度、散度、旋度背后统一的那个东西',
        date: '计划中',
      },
      {
        title: '朗道十卷重学记录',
        tagline: '一卷一卷啃，一卷一卷记',
        date: '计划中',
      },
    ],
  },
  {
    key: 'code',
    name: '编程',
    hand: 'code —',
    motto: '小而能读完的东西。',
    now: '下一本还没定，候选在笔记里。',
    emblem: 'graph',
    books: [
      {
        title: 'tinyautograd',
        tagline: 'MLX 之上约六百行的自动微分框架，配一本设计之书',
        href: 'https://dontreadthisline.github.io/tinyautograd/',
        date: '2026',
      },
    ],
  },
];
