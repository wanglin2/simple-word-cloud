const pxMap = {}
let minx = Infinity
let maxx = -Infinity
let miny = Infinity
let maxy = -Infinity

const addToMap = curWordItem => {
  curWordItem.imageData.data.forEach(item => {
    const x = item[0] + curWordItem.left
    const y = item[1] + curWordItem.top
    minx = Math.min(minx, x)
    maxx = Math.max(maxx, x)
    miny = Math.min(miny, y)
    maxy = Math.max(maxy, y)
    pxMap[x + '|' + y] = true
  })
}

const check = ({ elWidth, elHeight, curWordItem }) => {
  let sx, ex, sy, ey
  sx = ex = Math.floor(minx + (maxx - minx) / 2)
  sy = ey = Math.floor(miny + (maxy - miny) / 2)
  sx -= curWordItem.imageData.maxx - curWordItem.imageData.minx
  sy -= curWordItem.imageData.maxy - curWordItem.imageData.miny

  let stepLeft, stepTop
  if (elWidth > elHeight) {
    stepLeft = 1
    stepTop = elHeight / elWidth
  } else if (elHeight > elWidth) {
    stepTop = 1
    stepLeft = elWidth / elHeight
  } else {
    stepLeft = stepTop = 1
  }
  if (canFit(curWordItem, [sx, sy])) {
    return [sx, sy]
  }
  while (true) {
    let csx = Math.floor(sx)
    let csy = Math.floor(sy)
    let cex = Math.floor(ex)
    let cey = Math.floor(ey)
    for (let left = csx; left < cex; ++left) {
      let value = [left, csy]
      if (canFit(curWordItem, value)) {
        return value
      }
    }
    for (let left = cex; left > csx; --left) {
      let value = [left, cey]
      if (canFit(curWordItem, value)) {
        return value
      }
    }
    for (let top = csy; top < cey; ++top) {
      let value = [cex, top]
      if (canFit(curWordItem, value)) {
        return value
      }
    }
    for (let top = cey; top > csy; --top) {
      let value = [csx, top]
      if (canFit(curWordItem, value)) {
        return value
      }
    }

    sx -= stepLeft
    ex += stepLeft
    sy -= stepTop
    ey += stepTop
  }
}

const canFit = (curWordItem, [cx, cy]) => {
  if (pxMap[`${cx}|${cy}`]) return false
  return curWordItem.imageData.data.every(([x, y]) => {
    let left = x + cx
    let top = y + cy
    return !pxMap[`${left}|${top}`]
  })
}

this.addEventListener('message', e => {
  const action = e.data.action
  const data = e.data.data
  if (e.data.action === 'check') {
    let startTime = Date.now()
    const res = check(data)
    console.log(Date.now() - startTime)
    this.postMessage({
      action,
      data: res
    })
  } else if (e.data.action === 'addToMap') {
    addToMap(data)
    this.postMessage({
      action
    })
  }
})
