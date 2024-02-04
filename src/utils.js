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
export const joinFontStr = ({ italic, bold, fontSize, fontFamily }) => {
  return `${italic ? 'italic ' : ''} ${
    bold ? 'bold ' : ''
  } ${fontSize}px ${fontFamily} `
}

//计算节点的文本长宽
let measureTextContext = null
export const measureText = (text, { italic, bold, fontSize, fontFamily }) => {
  const font = joinFontStr({
    italic,
    bold,
    fontSize,
    fontFamily
  })
  if (!measureTextContext) {
    const canvas = document.createElement('canvas')
    measureTextContext = canvas.getContext('2d')
  }
  measureTextContext.save()
  measureTextContext.font = font
  const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } =
    measureTextContext.measureText(text)
  measureTextContext.restore()
  const height = actualBoundingBoxAscent + actualBoundingBoxDescent
  return { width, height }
}

// 获取文字的像素点数据
export const getImageData = ({ text, fontSize, fontFamily }) => {
  fontSize = fontSize / 2
  const canvas = document.createElement('canvas')
  let { width, height } = measureText(text, { fontSize, fontFamily })
  width = Math.ceil(width)
  height = Math.ceil(height)
  canvas.width = width
  canvas.height = height
  console.log(width, height)
  const ctx = canvas.getContext('2d')
  ctx.translate(width / 2, height / 2)
  const font = joinFontStr({
    fontSize,
    fontFamily
  })
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)
  const image = ctx.getImageData(0, 0, width, height).data
  const imageData = []
  let minx = Infinity
  let maxx = -Infinity
  let miny = Infinity
  let maxy = -Infinity
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const a = image[i * 4 + j * (width * 4) + 3]
      if (a > 0) {
        imageData.push([i, j])
        minx = Math.min(i, minx)
        maxx = Math.max(i, maxx)
        miny = Math.min(j, miny)
        maxy = Math.max(j, maxy)
      }
    }
  }
  return {
    data: imageData,
    minx,
    maxx,
    miny,
    maxy
  }
}

export const createWorker = code => {
  return new Worker(URL.createObjectURL(new Blob([code])))
}
