// 获取随机颜色
const colorList = [
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
export const getColor = () => {
  return colorList[Math.floor(Math.random() * colorList.length)]
}

// 拼接font字符串
export const joinFontStr = ({ fontSize, fontFamily, fontWeight }) => {
  return `${fontWeight} ${fontSize}px ${fontFamily} `
}

//计算文本宽高
let measureTextContext = null
export const measureText = (text, fontStyle) => {
  // 创建一个canvas用于测量
  if (!measureTextContext) {
    const canvas = document.createElement('canvas')
    measureTextContext = canvas.getContext('2d')
  }
  measureTextContext.save()
  // 设置文本样式
  measureTextContext.font = joinFontStr(fontStyle)
  // 测量文本
  const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } =
    measureTextContext.measureText(text)
  measureTextContext.restore()
  // 返回文本宽高
  const height = actualBoundingBoxAscent + actualBoundingBoxDescent
  return { width, height }
}

// 获取文字的像素点数据
export const getTextImageData = (text, fontStyle, space = 0, rotate = 0) => {
  const canvas = document.createElement('canvas')
  const lineWidth = space * fontStyle.fontSize * 2
  // 获取文本的宽高，并向上取整
  let { width, height } = measureText(text, fontStyle, lineWidth)
  const rect = getRotateBoundingRect(
    width + lineWidth,
    height + lineWidth,
    rotate
  )
  width = rect.width
  height = rect.height
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  // 绘制文本
  ctx.translate(width / 2, height / 2)
  ctx.rotate(degToRad(rotate))
  ctx.font = joinFontStr(fontStyle)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)
  if (lineWidth > 0) {
    ctx.lineWidth = lineWidth
    ctx.strokeText(text, 0, 0)
  }
  // 获取画布的像素数据
  const image = ctx.getImageData(0, 0, width, height).data
  // 遍历每个像素点，找出有内容的像素点
  const imageData = []
  // let minx = Infinity
  // let maxx = -Infinity
  // let miny = Infinity
  // let maxy = -Infinity
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // 如果a通道不为0，那么代表该像素点存在内容
      const a = image[x * 4 + y * (width * 4) + 3]
      if (a > 0) {
        imageData.push([x, y])
        // minx = Math.min(x, minx)
        // maxx = Math.max(x, maxx)
        // miny = Math.min(y, miny)
        // maxy = Math.max(y, maxy)
      }
    }
  }
  return {
    data: imageData,
    width,
    height
  }
}

export const createWorker = code => {
  return new Worker(URL.createObjectURL(new Blob([code])))
}

// 根据权重计算字号
export const getFontSize = (
  weight,
  minWeight,
  maxWeight,
  minFontSize,
  maxFontSize
) => {
  return (
    minFontSize +
    ((weight - minWeight) / (maxWeight - minWeight)) *
      (maxFontSize - minFontSize)
  )
}

// 计算旋转后的矩形的宽高
const getRotateBoundingRect = (width, height, rotate) => {
  const rad = degToRad(rotate)
  const w = width * Math.abs(Math.cos(rad)) + height * Math.abs(Math.sin(rad))
  const h = width * Math.abs(Math.sin(rad)) + height * Math.abs(Math.cos(rad))
  return {
    width: Math.ceil(w),
    height: Math.ceil(h)
  }
}

// 角度转弧度
const degToRad = deg => {
  return (deg * Math.PI) / 180
}
