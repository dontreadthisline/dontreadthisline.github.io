---
title: 矩阵求导的第一性直觉：形状对了，导数就对了
date: 2026-11-21
status: 读完了
layout: math
tags: [矩阵微分, 深度学习]
summary: 别背公式表了。记住一条规则：梯度与参数同形状，链式法则就是把能收缩的指标全部收缩掉。
marginalia: 这篇写完才发现，我以前查的那些"矩阵求导公式表"，九成能靠形状规则现场推出来。
---


反向传播写多了就会一直撞见同一个问题：$\partial L / \partial W$ 到底长什么形状？每次去查公式表，查完就忘。这篇笔记把这件事一次性理顺 —— 结论其实只有一条规则，剩下的全是它的推论。

## 先把约定钉死

矩阵求导的"混乱"一半来自约定不统一。数值布局还是分母布局（numerator / denominator layout），教科书间各说各话。工程上不用纠结，PyTorch 和 JAX 替我们选好了：

> **约定：标量损失 $L$ 对任何参数 $W$ 的梯度，与 $W$ 本身同形状。**

$$
\frac{\partial L}{\partial W} \in \mathbb{R}^{m \times n} \iff W \in \mathbb{R}^{m \times n}, \qquad
\left( \frac{\partial L}{\partial W} \right)_{ij} = \frac{\partial L}{\partial W_{ij}}
$$

这个约定的代价是：链式法则不再是普通的"矩阵乘法"，而是带着转置的收缩。收益是：任何一步形状不对，立刻暴露。

## 链式法则的本质：收缩

设线性层 $Y = XW$，其中 $X \in \mathbb{R}^{n \times d_{\text{in}}}$，$W \in \mathbb{R}^{d_{\text{in}} \times d_{\text{out}}}$。上游给了梯度 $G = \partial L / \partial Y$。求 $\partial L / \partial W$。

先按元素写，这是最诚实的一步。损失通过 $Y_{kj}$ 依赖 $W_{ij}$，而 $Y_{kj} = \sum_i X_{ki} W_{ij}$，所以：

$$
\frac{\partial L}{\partial W_{ij}}
= \sum_{k} \frac{\partial L}{\partial Y_{kj}} \cdot \frac{\partial Y_{kj}}{\partial W_{ij}}
= \sum_{k} G_{kj} \, X_{ki}
$$

右边这个求和，恰好是 $X^{\top} G$ 的 $(i,j)$ 元：

$$
\frac{\partial L}{\partial W} = X^{\top} G
$$

检查形状：$(d_{\text{in}} \times n) \cdot (n \times d_{\text{out}}) = (d_{\text{in}} \times d_{\text{out}})$，与 $W$ 同形状。

<div class="aha">
  链式法则的矩阵形式不需要背：把中间张量（这里是被 $n$ 批次维）能收缩的指标全部收缩掉，剩下的形状自动等于参数形状。转置只是收缩的副产品。
</div>

同一条规则再跑一遍 $\partial L / \partial X$：这次收缩的是 $d_{\text{out}}$ 维，

$$
\frac{\partial L}{\partial X} = G W^{\top}
\in \mathbb{R}^{n \times d_{\text{in}}}
$$

对称得几乎是强迫症：$W$ 左乘时 $X$ 转置，$X$ 右乘时 $W$ 转置。

## 用规则现场推一个：Embedding

公式表里 Embeding 的梯度长得最奇怪：scatter-add。其实按元素推一遍还是同一条规则。查表得到 $\text{idx} = (k_1, \dots, k_n)$，每行取 $E$ 的一行，$Y_{kj} = X_{k} \cdot E_{\text{idx}_k, j}$……

等等，这里 $X$ 已经退化成索引了，形状规则告诉你的是：$\partial L / \partial E$ 与 $E \in \mathbb{R}^{V \times d}$ 同形状，但 $n$ 行输入只会碰到 $E$ 的 $n$ 行。于是：

$$
\frac{\partial L}{\partial E_{v, j}} = \sum_{k:\, \text{idx}_k = v} G_{kj}
$$

同一个词出现几次，梯度就加几次 —— scatter-add 不是新规则，是"收缩掉不存在的那一维"的自然结果。而实现里的 `embed_grad[idx] += G` 之所以必须是 `+=`，理由在这里：重复索引就是共享节点。

## 数值对拍

任何推导都值得十行代码验证。中心差分，拿形状规则推的解析梯度和数值梯度对拍：

```python
def numgrad(f, W, eps=1e-5):
    g = np.zeros_like(W)
    it = np.nditer(W, flags=['multi_index'])
    for _ in it:
        i = it.multi_index
        w0 = W[i]
        W[i] = w0 + eps; fp = f()
        W[i] = w0 - eps; fm = f()
        W[i] = w0
        g[i] = (fp - fm) / (2 * eps)
    return g

assert np.allclose(X.T @ G, numgrad(lambda: loss(XW), W))
```

跑过的结论：形状规则推的四个公式（两个线性层梯度、Embedding 的 scatter-add、加上交叉熵的 $\mathrm{softmax} - y$）全部和数值梯度吻合到 $10^{-8}$ 量级。

<div class="aha">
  数值梯度是终极裁判：它不在乎你的约定，不在乎 numerator 还是 denominator layout。解析式和它对不上，先检查形状，再检查正负号，最后才怀疑公式。
</div>

## 结论

矩阵求导只需要两条：

1. **梯度与参数同形状**（约定，钉死不再想）
2. **链式法则 = 收缩掉所有中间指标**（规则，现场推）

公式表可以扔了。遇到新的层，按元素写出 $\partial L / \partial W_{ij}$，把哑指标求和吞掉，形状对上就收工。
