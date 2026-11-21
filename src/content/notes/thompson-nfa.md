---
title: Thompson 构造：正则如何在纸上变成状态机
date: 2026-11-19
status: 读完了
tags: [自动机, 编译原理]
summary: 给 tinyregex 铺路的笔记。每种 AST 节点长出一台一进一出的小机器，串起来就是 NFA。
marginalia: "epsilon 闭包第一次写成代码时把集合当列表用，查了一个小时的 bug。教训：闭包是集合语义。"
---

为 [tinyregex](/works/tinyregex/) 铺的底。结论先放前面：

> Thompson 构造 = 给每种 AST 节点配一台**一进一出**的小状态机，然后按树的结构把它们焊接起来。

## 为什么可行

归纳构造。假设子表达式 $e_1$、$e_2$ 已经各自拥有一台只有一个起点、一个终点的 NFA，那么三种复合都只花 $O(1)$ 个新状态：

**并** $e = e_1 \mid e_2$：新起点 $s$ 用两条 $\varepsilon$ 边分别跳进两台机器，两台机器的终点用 $\varepsilon$ 边汇入新终点 $f$：

$$
\delta(s, \varepsilon) = \{s_1, s_2\}, \qquad \delta(f_1, \varepsilon) = \delta(f_2, \varepsilon) = \{f\}
$$

**连接** $e = e_1 e_2$：最省，一条 $\varepsilon$ 边从 $f_1$ 接到 $s_2$，完事：

$$
\delta(f_1, \varepsilon) = \{s_2\}
$$

**闭包** $e = e_1^{*}$：起点终点各一，外加一条"再跑一遍"的回头路和一条"一次都不跑"的直通：

$$
\delta(s, \varepsilon) = \{s_1, f\}, \qquad \delta(f_1, \varepsilon) = \{s_1, f\}
$$

三个式子看下来有个共同点：**新状态永远只通过 $\varepsilon$ 边参与游戏**。这让构造代码退化成纯粹的体力活：

```python
def thompson(node):
    match node:
        case Char(c):
            s, f = State(), State()
            s.edge(c, f)
        case Alt(l, r):
            s, f = State(), State()
            (s1, f1), (s2, f2) = thompson(l), thompson(r)
            s.eps(s1, s2); f1.eps(f); f2.eps(f)
        # ... 每个 case 都是十几行
    return s, f
```

## 状态数的账

$n$ 是正则的长度，Thompson 构造最多产出 $2n$ 个状态 —— 线性。对比教科书里直接回溯的写法，这个线性上界就是它五十年来还在被教的原因。

真正贵的是后面那步：把 NFA 确定化成 DFA，最坏 $2^n$ 个状态。tinyregex 的选择是不确定化，读一个字符推一次 $\varepsilon$ 闭包 —— 拿指数最坏情形换"每一行都读得懂"。

## 一个容易写错的细节

$\varepsilon$ 闭包是**集合**语义。用列表存"当前状态集合"，重复状态混进去，`a*a` 这种回环模式会悄悄算错。我在第二遍写的时候才意识到闭包要做成：

```python
def eps_closure(states: set[State]) -> set[State]:
    seen, stack = set(states), list(states)
    while stack:
        s = stack.pop()
        for t in s.eps_edges:
            if t not in seen:
                seen.add(t); stack.append(t)
    return seen
```

不动点式的遍历，`seen` 既是结果又是去重器。
