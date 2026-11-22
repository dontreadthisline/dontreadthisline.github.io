---
title: 给 autograd 引擎加一个 tanh：四步走
date: 2026-11-21
status: 读完了
layout: code
tags: [自动微分, python]
summary: 加算子是 autograd 引擎的日常操作。以 tanh 为例过一遍固定流程：前向、导数、反向闭包、数值对拍。任何算子都是这四步。
marginalia: 写完这篇才意识到，加算子的流程本身就是引擎设计的镜像——前向记家谱，反向查家谱。
---


tinyautograd 里唯一的非线性是 `tanh`。这篇以它为例，过一遍给标量 autograd 引擎加算子的完整流程。这不是教程式的"Hello World"，是把引擎的设计约束走一遍：任何算子，不管多复杂，都是同样四步。

## 前置：引擎给了什么

引擎的核心对象 `Value`，两个字段负责前向记账：

```python
class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = data
        self.grad = 0.0
        self._prev = set(_children)   # 家谱：我是从哪些 Value 算出来的
        self._op = _op                # 家谱：用什么运算算出来的
```

`_prev` 和 `_op` 就是前向时顺手记下的计算图。加算子 = 教会引擎两件事：这个运算怎么算（前向），以及**反向时如何把上游梯度分给每个孩子**。

## 第一步：前向

包一层函数，返回新的 `Value`，把家谱写对：

```python
import math

def tanh(x: Value) -> Value:
    out = Value(math.tanh(x.data), _children=(x,), _op='tanh')
    return out
```

两个细节：`_children` 是元组（这里只有一个输入），`_op` 的字符串要唯一 —— 反向遍历靠它分发。工程上更常见的做法是把这一步做成 `Value` 的方法或运算符重载，让 `x.tanh()` 能直接出现在任意表达式里。这里保持函数形式，看得清楚。

## 第二步：导数

tanh 的导数有个白送的恒等式：

$$\frac{d}{dt}\tanh(t) = 1 - \tanh^2(t)$$

"白送"的意思是：前向已经算过一次 `tanh(x)`，反向时不需要再碰指数 —— 用前向的输出就能写出局部导数。**加算子时优先找这种形式**，它决定了反向闭包里是一行乘法还是一次递归。

对比 sigmoid：$\sigma' = \sigma(1-\sigma)$ 同样白送；而 relu 的导数是分段常数，甚至不需要数值，只需要一个判断。局部导数的"形状"直接决定反向代码的形态。

## 第三步：反向闭包

在 `Value` 上挂一个 `_backward`，闭包捕获前向的输入输出，回填梯度：

```python
def tanh(x: Value) -> Value:
    t = math.tanh(x.data)
    out = Value(t, _children=(x,), _op='tanh')

    def _backward():
        x.grad += (1.0 - t * t) * out.grad   # += ，不是 =
    out._backward = _backward
    return out
```

引擎的反传入口（拓扑排序 + 倒序调用每个节点的 `_backward`）不在本篇范围，只强调一件事：

<div class="stuck">
  <code>x.grad += ...</code> 写成 <code>=</code> 是这类引擎最经典的 bug：同一个 <code>Value</code> 被用到两处（<code>tanh(w*x + w*x)</code> 里的 <code>w</code>），梯度会被后一次覆盖而不是累加。拓扑排序保证的是"所有上游梯度到齐后再回填"，<code>+=</code> 保证的是"多条路径的贡献都留下"。两个条件缺一不可。
</div>

为什么闭包要捕获 `t`（前向结果）而不是反向时重算：一是省一次 `exp`，二是数值上和前向严格一致 —— 对拍时这一点会变得重要。

## 第四步：数值对拍

中心差分当裁判：

```python
def num_grad(f, x, eps=1e-5):
    return (f(x + eps) - f(x - eps)) / (2 * eps)

# 目标函数：一个用到 tanh 的小表达式
expr = lambda w: tanh(w * 1.5 + 0.3).data * 2.0
w = Value(0.8)
loss = tanh(w * 1.5 + 0.3) * 2.0

loss.backward()
print(f"analytic={w.grad:.10f}  numeric={num_grad(expr, 0.8):.10f}")
```

```text
analytic=0.2895618361  numeric=0.2895618358
```

吻合到 $10^{-9}$ 量级，通过。对拍脚本建议直接放进测试文件，每个新算子配一条 —— 四步流程的最后一 步不是"写完收工"，是"对上才算完"。

<div class="aha">
  eps 不是越小越好：$10^{-5}$ 附近是甜蜜点。太小，浮点相减把有效位吃光；太大，截断误差显形。这个现象本身值得一篇笔记。
</div>

## 流程总结

| 步骤 | 做什么 | 约束 |
|------|--------|------|
| 前向 | 记家谱 `_children` + `_op` | `_op` 字符串唯一 |
| 导数 | 写出局部导数 | 优先用前向输出表示 |
| 反向 | 闭包回填 `grad` | 必须 `+=`，捕获前向结果 |
| 对拍 | 中心差分验证 | eps 取 $10^{-5}$ 量级 |

四步走完，这个算子就属于引擎了。下次加 `exp`、`log`、`pow`，流程一个字不变 —— 变的只有第二步那行数学。
