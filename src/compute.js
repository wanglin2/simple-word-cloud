const pxMap = {}
let centerX = -1
let centerY = -1
let left = Infinity
let right = -Infinity
let top = Infinity
let bottom = -Infinity

// 清空状态
export const clear = () => {
  pxMap = {}
  centerX = -1
  centerY = -1
  left = Infinity
  right = -Infinity
  top = Infinity
  bottom = -Infinity
}

// 保存每个文本的像素数据
export const addToMap = curWordItem => {
  curWordItem.imageData.data.forEach(item => {
    const x = item[0] + curWordItem.left
    const y = item[1] + curWordItem.top
    pxMap[x + '|' + y] = true
    // 更新边界
    left = Math.min(left, x)
    right = Math.max(right, x)
    top = Math.min(top, y)
    bottom = Math.max(bottom, y)
  })
  // 记录第一个文本的中心点位置
  if (centerX === -1 && centerY === -1) {
    centerX = Math.floor(curWordItem.imageData.width / 2)
    centerY = Math.floor(curWordItem.imageData.height / 2)
  }
}

// 获取边界数据
export const getBoundingRect = () => {
  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top
  }
}

// 计算文本渲染位置
export const getPosition = ({ elWidth, elHeight, curWordItem }) => {
  let startX, endX, startY, endY
  // 第一个文本的中心点
  startX = endX = centerX
  startY = endY = centerY

  // 根据容器的宽高来计算扩散步长
  let stepLeft = 1,
    stepTop = 1
  if (elWidth > elHeight) {
    stepLeft = 1
    stepTop = elHeight / elWidth
  } else if (elHeight > elWidth) {
    stepTop = 1
    stepLeft = elWidth / elHeight
  }

  if (canFit(curWordItem, [startX, startY])) {
    return [startX, startY]
  }
  // 依次扩散遍历每个像素点
  while (true) {
    // 向下取整作为当前比较的值
    const curStartX = Math.floor(startX)
    const curStartY = Math.floor(startY)
    const curEndX = Math.floor(endX)
    const curEndY = Math.floor(endY)

    // 遍历矩形右侧的边
    for (let top = curStartY; top < curEndY; ++top) {
      const value = [curEndX, top]
      if (canFit(curWordItem, value)) {
        return value
      }
    }
    // 遍历矩形下面的边
    for (let left = curEndX; left > curStartX; --left) {
      const value = [left, curEndY]
      if (canFit(curWordItem, value)) {
        return value
      }
    }
    // 遍历矩形左侧的边
    for (let top = curEndY; top > curStartY; --top) {
      const value = [curStartX, top]
      if (canFit(curWordItem, value)) {
        return value
      }
    }
    // 遍历矩形上面的边
    for (let left = curStartX; left < curEndX; ++left) {
      const value = [left, curStartY]
      if (canFit(curWordItem, value)) {
        return value
      }
    }
    // 向四周扩散
    startX -= stepLeft
    endX += stepLeft
    startY -= stepTop
    endY += stepTop
  }
}

// 判断某个像素点所在位置能否完全容纳某个文本
const canFit = (curWordItem, [cx, cy]) => {
  if (pxMap[`${cx}|${cy}`]) return false
  return curWordItem.imageData.data.every(([x, y]) => {
    const left = x + cx
    const top = y + cy
    return !pxMap[`${left}|${top}`]
  })
}

// this.addEventListener('message', e => {
//   const action = e.data.action
//   const data = e.data.data
//   if (e.data.action === 'getPosition') {
//     let startTime = Date.now()
//     const res = getPosition(data)
//     this.postMessage({
//       action,
//       data: res
//     })
//   } else if (e.data.action === 'addToMap') {
//     addToMap(data)
//     this.postMessage({
//       action
//     })
//   }
// })
