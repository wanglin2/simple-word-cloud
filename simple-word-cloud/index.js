import WordItem from './src/WordItem'
import {
  getFontSize,
  getTextBoundingRect,
  createRandom,
  joinFontStr,
  downloadFile
} from './src/utils'
import { addToMap, getPosition, getBoundingRect, clear } from './src/compute'

// 词云类
class WordCloud {
  constructor({ el, ...rest }) {
    // 词云渲染的容器元素
    this.el = el
    this.updateElSize()
    if (this.elWidth <= 0 || this.elHeight <= 0)
      throw new Error('容器宽高不能为0')
    const elPosition = window.getComputedStyle(this.el).position
    if (elPosition === 'static') {
      this.el.style.position = 'relative'
    }
    this.updateOption(rest)
    // 文本元素复用列表
    this.wordItemElList = []
    // canvas
    this.canvas = null
    this.renderCtx = null
  }

  // 更新容器大小
  updateElSize() {
    const elRect = this.el.getBoundingClientRect()
    this.elWidth = elRect.width
    this.elHeight = elRect.height
  }

  // 当容器大小改变了需要调用该方法
  // 此外，你需要自行再次调用run方法或render方法
  resize() {
    this.updateElSize()
  }

  // 更新配置选项
  updateOption({
    minFontSize,
    maxFontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    fontSizeScale,
    rotateType,
    space,
    colorList,
    transition,
    smallWeightInCenter,
    onClick
  }) {
    // 字号大小
    this.minFontSize = minFontSize || 12
    this.maxFontSize = maxFontSize || 40
    if (this.maxFontSize < this.minFontSize)
      throw new Error('maxFontSize不能小于minFontSize')
    // 字体
    this.fontFamily = fontFamily || '微软雅黑, Microsoft YaHei'
    // 加粗
    this.fontWeight = fontWeight || ''
    // 斜体
    this.fontStyle = fontStyle || ''
    // 文字之间的间距，相对于字号，即该值会和字号相乘得到最终的间距
    this.space = space || 0
    // 文字颜色列表
    this.colorList = colorList
    // 旋转类型，none（无）、cross（交叉，即要么是无旋转，要么是-90度旋转）、oblique（倾斜，即-45度旋转）、random（随机。即-90度到90度之间），如果要针对某个文本
    this.rotateType = rotateType || 'none'
    // 文字整体的缩小比例，用于加快计算速度，一般是0-1之间的小数
    this.fontSizeScale = fontSizeScale || 1 / this.minFontSize
    // 文本元素过渡动画
    this.transition = transition || 'all 0.5s ease'
    // 按权重从小到大的顺序渲染，默认是按权重从大到小进行渲染
    this.smallWeightInCenter = smallWeightInCenter || false
    // 点击事件
    this.onClick = onClick || null
    // 当前渲染的列表
    this.curRenderList = []
  }

  // 创建旋转角度
  createRotate() {
    switch (this.rotateType) {
      case 'cross':
        return Math.random() > 0.5 ? -90 : 0
      case 'oblique':
        return -45
      case 'random':
        return createRandom(-90, 90)
      default:
        return 0
    }
  }

  // 计算词云位置
  run(words = [], done = () => {}) {
    clear()
    // 按权重从大到小排序
    const wordList = [...words].sort((a, b) => {
      return this.smallWeightInCenter ? a[1] - b[1] : b[1] - a[1]
    })
    let minWeight = wordList[wordList.length - 1][1]
    let maxWeight = wordList[0][1]
    if (this.smallWeightInCenter) {
      const tmp = minWeight
      minWeight = maxWeight
      maxWeight = tmp
    }
    // 创建词云文本实例
    const wordItemList = wordList.map(item => {
      const text = item[0]
      const weight = item[1]
      const config = item[2] || {}
      // 旋转角度
      let rotate = 0
      if (!Number.isNaN(Number(config.rotate))) {
        rotate = Number(config.rotate)
      } else {
        rotate = this.createRotate()
      }
      return new WordItem({
        text,
        weight,
        space: config.space || this.space,
        rotate,
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
          fontWeight: config.fontWeight || this.fontWeight,
          fontStyle: config.fontStyle || this.fontStyle
        }
      })
    })
    this.compute(wordItemList)
    this.fitContainer(wordItemList)
    done(wordItemList)
  }

  // 计算并使用canvas渲染到容器内
  renderUseCanvas(words, done = () => {}) {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.canvas.width = this.elWidth
      this.canvas.height = this.elHeight
      this.el.appendChild(this.canvas)
      this.renderCtx = this.canvas.getContext('2d')
      this.canvas.addEventListener('click', e => {
        this.onCanvasClick(e)
      })
    }
    this.renderCtx.clearRect(0, 0, this.elWidth, this.elHeight)
    this.run(words, list => {
      this.curRenderList = list
      list.forEach(item => {
        this.renderCtx.save()
        this.renderCtx.font = joinFontStr(item.fontStyle)
        this.renderCtx.fillStyle = item.color
        if (item.rotate === 0) {
          this.renderCtx.textBaseline = 'top'
          this.renderCtx.fillText(item.text, item.left, item.top)
        } else {
          const cx = item.left + item.width / 2
          const cy = item.top + item.height / 2
          this.renderCtx.translate(cx, cy)
          this.renderCtx.textAlign = 'center'
          this.renderCtx.textBaseline = 'middle'
          this.renderCtx.rotate((item.rotate * Math.PI) / 180)
          this.renderCtx.fillText(item.text, 0, 0)
        }
        this.renderCtx.restore()
      })
      done(list)
    })
  }

  // Canvas的点击事件
  onCanvasClick(e) {
    const { left, top } = this.canvas.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    let res = null
    for (let i = 0; i < this.curRenderList.length; i++) {
      const item = this.curRenderList[i]
      this.renderCtx.save()
      this.renderCtx.font = joinFontStr(item.fontStyle)
      this.renderCtx.fillStyle = item.color
      this.renderCtx.textBaseline = 'top'
      this.renderCtx.beginPath()
      if (item.rotate === 0) {
        this.renderCtx.rect(item.left, item.top, item.width, item.height)
      } else {
        const textSize = getTextBoundingRect({
          text: item.text,
          fontStyle: item.fontStyle,
          space: item.space
        })
        const cx = item.left + item.width / 2
        const cy = item.top + item.height / 2
        this.renderCtx.translate(cx, cy)
        this.renderCtx.rotate((item.rotate * Math.PI) / 180)
        this.renderCtx.rect(
          -textSize.width / 2,
          -textSize.height / 2,
          textSize.width,
          textSize.height
        )
      }
      this.renderCtx.closePath()
      this.renderCtx.restore()
      const isIn = this.renderCtx.isPointInPath(x, y)
      if (isIn) {
        res = item
        break
      }
    }
    if (res && this.onClick) {
      this.onClick(res)
    }
  }

  // 导出画布，只有当使用renderUseCanvas方法渲染时才有效
  // isDownload：是否直接触发下载，为false则返回data:URL数据
  exportCanvas(isDownload = true, fileName = 'wordCloud') {
    if (!this.canvas) return null
    const res = this.canvas.toDataURL()
    if (isDownload) {
      downloadFile(res, fileName)
    } else {
      return res
    }
  }

  // 计算并使用DOM直接渲染到容器内
  render(words, done = () => {}) {
    this.run(words, list => {
      this.curRenderList = []
      list.forEach((item, index) => {
        const exist = this.wordItemElList[index]
        let wrap = null
        let inner = null
        if (exist) {
          wrap = exist.wrap
          inner = exist.inner
        } else {
          wrap = document.createElement('div')
          wrap.className = 'simpleWordCloudWordItemWrap'
          wrap.style.cssText = `
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            left: ${this.elWidth / 2}px;
            top: ${this.elHeight / 2}px;
          `
          inner = document.createElement('div')
          inner.className = 'simpleWordCloudWordItemInner'
          inner.style.cssText = `
            white-space: nowrap;
          `
          wrap.appendChild(inner)
          this.wordItemElList.push({
            wrap,
            inner
          })
          wrap.addEventListener('click', () => {
            if (this.onClick) this.onClick(item)
          })
          this.el.appendChild(wrap)
        }
        setTimeout(() => {
          wrap.style.left = `${item.left}px`
          wrap.style.top = `${item.top}px`
          wrap.style.width = `${item.width}px`
          wrap.style.height = `${item.height}px`
          wrap.style.transition = this.transition

          inner.style.fontSize = `${item.fontStyle.fontSize}px`
          inner.style.fontFamily = `${item.fontStyle.fontFamily}`
          inner.style.fontWeight = `${item.fontStyle.fontWeight}`
          inner.style.color = `${item.color}`
          inner.style.transform = `rotate(${item.rotate}deg)`
          inner.style.fontStyle = item.fontStyle.fontStyle
          inner.textContent = item.text
        }, 0)
      })
      // 删除多余的元素
      if (this.wordItemElList.length > list.length) {
        const wordItemElList = [...this.wordItemElList]
        for (let i = wordItemElList.length - 1; i >= list.length; i--) {
          this.el.removeChild(wordItemElList[i].wrap)
          this.wordItemElList.splice(i, 1)
        }
      }
      done(list)
    })
  }

  // 清除渲染
  clear() {
    this.curRenderList = []
    if (this.canvas) {
      this.el.removeChild(this.canvas)
      this.canvas = null
      this.renderCtx = null
    } else {
      this.el.innerHTML = ''
      this.wordItemElList = []
    }
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
      item.fontStyle.fontSize *= scale

      // 重新计算文本包围框大小而不是直接缩放，因为文本包围框大小和字号并不成正比
      const { width, height } = getTextBoundingRect({
        text: item.text,
        fontStyle: item.fontStyle,
        space: item.space,
        rotate: item.rotate
      })
      item.width = width
      item.height = height

      // 修正超出容器文本
      if (item.left + item.width > this.elWidth) {
        item.left = this.elWidth - item.width
      }
      if (item.top + item.height > this.elHeight) {
        item.top = this.elHeight - item.height
      }
    })
  }
}

export default WordCloud
