import { getImageData } from './utils'

class WordItem {
  constructor({ text, weight, fontSize, fontFamily, color }) {
    this.text = text
    this.weight = weight
    this.fontSize = fontSize
    this.fontFamily = fontFamily
    this.imageData = getImageData({ text, fontSize, fontFamily })
    this.left = 0
    this.top = 0
    this.color = color
  }
}

export default WordItem
