# simple-word-cloud

> 一个简单的词云库

## 安装

```bash
npm i simple-word-cloud
```

> 注意：源码未打包直接发布，有需要请自行配置打包文件。

## 使用

```html
<div id="container"></div>
```

```js
import SimpleWordCloud from 'simple-word-cloud'

const wordCloud = new SimpleWordCloud({
  el: document.getElementById('container') // 容器元素，大小不能为0
  // 其他配置选项
})
wordCloud.render([
  ['文字', 12, {}] // ['文字', 权重， 配置选项]
  // ...
])
```

## 文档

### 创建实例

```js
const wordCloud = new SimpleWordCloud(options)
```

#### 参数options

对象类型，可以传递以下选项：

| 属性                | 类型             | 默认值                    | 描述                                                         |
| ------------------- | ---------------- | ------------------------- | ------------------------------------------------------------ |
| el                  | DOM Element      |                           | 容器元素，必填                                               |
| minFontSize         | Number           | 12                        | 文字最小的字号                                               |
| maxFontSize         | Number           | 40                        | 文字最大的字号                                               |
| fontFamily          | String           | 微软雅黑, Microsoft YaHei | 字体                                                         |
| fontWeight          | String 、 number |                           | 加粗                                                         |
| fontStyle           | String           |                           | 斜体                                                         |
| space               | Number           | 0                         | 文字之间的间距，相对于字号，即该值会和字号相乘得到最终的间距，一般设置为0-1之间的小数 |
| colorList           | Array            | 见下方                    | 文字颜色列表                                                 |
| rotateType          | String           | none                      | 旋转类型，none（无）、cross（交叉，即要么是无旋转，要么是-90度旋转）、oblique（倾斜，即-45度旋转）、random（随机。即-90度到90度之间），如果要针对某个文本 |
| fontSizeScale       | Number           | 1 / minFontSize           | 计算时文字整体的缩小比例，用于加快计算速度，一般是0-1之间的小数，如果你没有非常清楚该配置的功能，那么请不要修改 |
| transition          | String           | all 0.5s ease             | 文本元素过渡动画，css的transition属性                        |
| smallWeightInCenter | Boolean          | false                     | 按权重从小到大的顺序渲染，默认是按权重从大到小进行渲染       |

##### 默认颜色列表

```js
[
  '#326BFF',
  '#5C27FE',
  '#C165DD',
  '#FACD68',
  '#FC76B3',
  '#1DE5E2',
  '#B588F7',
  '#08C792',
  '#FF7B02',
  '#3bc4c7',
  '#3a9eea',
  '#461e47',
  '#ff4e69'
]
```

### 方法

#### run(*words* = [], done = () => {})

- `words`：数组，每一项也是一个数组，结构为：['文字','权重', '配置']，比如：

```js
[
    ['文字', 12, {
        rotate: 45
    }]
]
```

所有可用配置如下：

```js
{
    rotate,// Number，旋转角度
    space,// 同实例选项的space
    color,// 文字颜色，不设置则随机
    fontFamily,// 字体
    fontWeight,// 加粗
    fontStyle// 斜体
}
```

- `done`：回调函数，接收一个参数，词云实例列表，你可以根据该列表进行渲染

仅计算词云位置，不包含渲染操作，所以你需要拿到计算完位置和大小后的词云实例列表来自行渲染。



#### render(*words*, done = () => {})

计算并直接渲染到容器内。



#### updateOption(options)

更新配置，`options`同实例化配置。不包含`el`选项。



#### resize()

当容器大小改变了需要调用该方法。此外，你需要自行再次调用`run`方法或`render`方法。



## 本地开发

```bash
git clone https://github.com/wanglin2/simple-word-cloud.git
cd simple-word-cloud
npm i
npm link
cd ..
npm i
npm link simple-word-cloud
npm run dev
```
