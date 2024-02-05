import { getTextImageData, getColor } from './utils'

// 文本类
class WordItem {
  constructor({ text, weight, fontStyle, color }) {
    // 文本
    this.text = text
    // 权重
    this.weight = weight
    // 字体样式
    this.fontStyle = fontStyle
    // 文本颜色
    this.color = color || getColor()
    // 文本像素数据
    this.imageData = getTextImageData(text, fontStyle)
    // 文本渲染的位置
    this.left = 0
    this.top = 0
  }
}

export default WordItem
