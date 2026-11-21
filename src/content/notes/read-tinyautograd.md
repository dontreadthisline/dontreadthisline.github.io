---
title: 读 tinyautograd：六百行怎么装下一个自动微分框架
date: 2026-11-14
status: 写着呢
tags: [自动微分, python, 源码阅读]
summary: 跟着一个极小的 autograd 实现走一遍：标量、计算图、反传。读到反传那节卡住了，笔记先记到这。
marginalia: 卡住的地方在第 4 节 topological order——不是不懂拓扑排序，是没想明白为什么必须先排序再反传。想通了再补。
---

起因是看到 [tinyautograd](https://dontreadthisline.github.io/tinyautograd/) 这个项目：约六百行 Python，装下一个能训练神经网络的自动微分框架。比 micrograd 略大，但每一行都有注释自己"为什么"。

## 前向：所有运算只认识标量

第一步反直觉的地方：**没有 Tensor，只有标量**。每个 `Value` 只存一个数和两个指针：

```python
class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = data
        self.grad = 0.0
        self._prev = set(_children)
        self._op = _op        # 记住自己是被什么运算造出来的
```

`_op` 是关键 —— 它是反向传播时"我该怎么把梯度分给孩子"的依据。前向时顺手把家谱记下来，这就是计算图。

## 加法和乘法的反传规则

两种原子运算的梯度规则，整本书就这两页：

加法是**分发**：梯度原封不动传给两个孩子

$$\frac{\partial (x + y)}{\partial x} = \frac{\partial (x + y)}{\partial y} = 1$$

乘法是**交换**：每个孩子收到"对方值 × 上游梯度"

$$\frac{\partial (xy)}{\partial x} = y \cdot \frac{\partial L}{\partial (xy)}$$

神经网络的全部非线性都靠 `tanh`，因为它的导数有个白送的恒等式：

$$\frac{d}{dt}\tanh(t) = 1 - \tanh^2(t)$$

前向算过 `tanh` 的话，反传连指数都不用碰。

## 卡住的地方

`backward()` 不是递归，而是**先拓扑排序、再倒序遍历**：

```python
def backward(self):
    topo, visited = [], set()
    def build(v):
        if v not in visited:
            visited.add(v)
            for c in v._prev: build(c)
            topo.append(v)
    build(self)
    self.grad = 1.0
    for v in reversed(topo):
        v._backward()
```

直觉上递归到底再一层层返回应该也行 —— 但实际上会在共享节点（比如 `w * x + w * x` 里被用两次的 `w`）上重复展开。为什么排序后倒序就天然避开这个问题，我还没完全想透。

**笔记先记到这里，想通了往下补。**
