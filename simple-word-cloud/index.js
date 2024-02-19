import WordItem from './src/WordItem'
import { getFontSize } from './src/utils'
import { addToMap, getPosition, getBoundingRect } from './src/compute'

// 词云类
class WordCloud {
  constructor({
    el,
    minFontSize,
    maxFontSize,
    fontFamily,
    fontWeight,
    fontSizeScale,
    space,
    colorList
  }) {
    // 词云渲染的容器元素
    this.el = el
    const elRect = el.getBoundingClientRect()
    this.elWidth = elRect.width
    this.elHeight = elRect.height
    // 字号大小
    this.minFontSize = minFontSize || 12
    this.maxFontSize = maxFontSize || 40
    // 字体
    this.fontFamily = fontFamily || '微软雅黑'
    // 加粗
    this.fontWeight = fontWeight || ''
    // 间距
    this.space = space || 0.1
    // 文字颜色列表
    this.colorList = colorList
    // 文字整体的缩小比例，用于加快计算速度，一般是0-1之间的小数
    this.fontSizeScale = fontSizeScale || 1 / this.minFontSize
  }

  // 开始计算
  run(words = [], done = () => {}) {
    // 按权重从大到小排序
    const wordList = [...words].sort((a, b) => {
      return b[1] - a[1]
    })
    const minWeight = wordList[wordList.length - 1][1]
    const maxWeight = wordList[0][1]
    // 创建词云文本实例
    const wordItemList = wordList.map(item => {
      const text = item[0]
      const weight = item[1]
      const config = item[2] || {}
      return new WordItem({
        text,
        weight,
        space: config.space || this.space,
        rotate: config.rotate || 0,
        color: config.color,
        colorList: this.colorList,
        fontStyle: {
          fontSize:
            getFontSize(
              weight,
              minWeight,
              maxWeight,
              this.minFontSize,
              this.maxFontSize
            ) * this.fontSizeScale,
          fontFamily: config.fontFamily || this.fontFamily,
          fontWeight: config.fontWeight || this.fontWeight
        }
      })
    })
    this.compute(wordItemList)
    this.fitContainer(wordItemList)
    const res = wordItemList.map(item => {
      return {
        text: item.text,
        left: item.left,
        top: item.top,
        color: item.color,
        fontStyle: item.fontStyle,
        rotate: item.rotate,
        width: item.width,
        height: item.height
      }
    })
    done(res)
  }

  // 直接渲染到容器内
  render(words, done) {
    this.run(words, list => {

    })
  }

  // 计算文本的位置
  compute(wordItemList) {
    for (let i = 0; i < wordItemList.length; i++) {
      const curWordItem = wordItemList[i]
      // 将第一个文本的像素数据保存到map中
      if (i === 0) {
        addToMap(curWordItem)
        continue
      }
      // 依次计算后续的每个文本的显示位置
      const res = getPosition({
        curWordItem,
        elWidth: this.elWidth,
        elHeight: this.elHeight
      })
      curWordItem.left = res[0]
      curWordItem.top = res[1]
      // 计算出位置后的每个文本也需要将像素数据保存到map中
      addToMap(curWordItem)
    }
  }

  // 根据容器大小调整字号
  fitContainer(wordItemList) {
    const elRatio = this.elWidth / this.elHeight
    let { width, height, left, top } = getBoundingRect()
    const wordCloudRatio = width / height
    let w, h
    let offsetX = 0,
      offsetY = 0
    if (elRatio > wordCloudRatio) {
      // 词云高度以容器高度为准，宽度根据原比例进行缩放
      h = this.elHeight
      w = wordCloudRatio * this.elHeight
    } else {
      // 词云宽度以容器宽度为准，高度根据原比例进行缩放
      w = this.elWidth
      h = this.elWidth / wordCloudRatio
    }
    const scale = w / width
    // 将词云移动到容器中间
    left *= scale
    top *= scale
    if (elRatio > wordCloudRatio) {
      offsetY = -top
      offsetX = -left + (this.elWidth - w) / 2
    } else {
      offsetX = -left
      offsetY = -top + (this.elHeight - h) / 2
    }
    wordItemList.forEach(item => {
      item.left *= scale
      item.top *= scale
      item.left += offsetX
      item.top += offsetY
      item.width *= scale
      item.height *= scale
      item.fontStyle.fontSize *= scale
    })
  }
}

export default WordCloud
