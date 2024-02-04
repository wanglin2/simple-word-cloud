import workerCode from './worker?raw'
import { createWorker } from './utils'

class Layout {
  constructor({ wordItemList, elWidth, elHeight, done }) {
    this.wordItemList = wordItemList
    this.elWidth = elWidth
    this.elHeight = elHeight
    this.done = done
    this.worker = createWorker(workerCode)

    this.run()
  }

  postMessage(action, data) {
    return new Promise(resolve => {
      this.worker.postMessage({
        action,
        data
      })
      const onMessage = e => {
        if (e.data.action === action) {
          this.worker.removeEventListener('message', onMessage)
          resolve(e.data.data)
        }
      }
      this.worker.addEventListener('message', onMessage)
    })
  }

  run() {
    let index = 0
    let run = async () => {
      if (index >= this.wordItemList.length) {
        return this.done()
      }
      const curWordItem = this.wordItemList[index]
      if (index === 0) {
        await this.postMessage('addToMap', curWordItem)
        index++
        run()
        return
      }
      const res = await this.postMessage('check', {
        curWordItem,
        elWidth: this.elWidth,
        elHeight: this.elHeight
      })
      curWordItem.left = res[0]
      curWordItem.top = res[1]
      await this.postMessage('addToMap', curWordItem)
      index++
      run()
    }
    run()
  }
}

export default Layout
