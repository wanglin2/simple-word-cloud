<script setup>
import { ref, watch } from 'vue'
import exampleData from './example'
import WordItem from './WordItem'
import Layout from './Layout'
import { getColor } from './utils'

const startTime = Date.now()

// 字号区间
const minFontSize = 12
const maxFontSize = 50

// 按权重排序
const wordList = [...exampleData].sort((a, b) => {
  return a[1] - b[1]
})
console.log(wordList)
const wordItemList = wordList
  .map((item, index) => {
    return new WordItem({
      text: item[0],
      weight: item[1],
      fontSize:
        minFontSize +
        Math.floor(
          ((index + 1) / wordList.length) * (maxFontSize - minFontSize)
        ),
      fontFamily: '微软雅黑',
      color: getColor()
    })
  })
  .reverse()
console.log(wordItemList)

const list = ref([])
const duration = ref(0)

// 布局计算
new Layout({
  wordItemList,
  elWidth: 600,
  elHeight: 400,
  done: () => {
    list.value = wordItemList.map(item => {
      return {
        text: item.text,
        left: item.left * 2,
        top: item.top * 2,
        fontSize: item.fontSize,
        color: item.color,
        fontFamily: item.fontFamily
      }
    })
    console.log(list.value)

    const endTime = Date.now()
    duration.value = (endTime - startTime) / 1000
  }
})
</script>

<template>
  <div>共耗时：{{ duration }}秒</div>
  <div class="container">
    <div
      class="wordItem"
      v-for="(item, index) in list"
      :key="index"
      :style="{
        left: item.left + 'px',
        top: item.top + 'px',
        fontSize: item.fontSize + 'px',
        fontFamily: item.fontFamily,
        color: item.color
      }"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  width: 600px;
  height: 400px;
  border: 1px solid #000;
  margin: 200px auto;
  position: relative;

  .wordItem {
    position: absolute;
    white-space: nowrap;
  }
}
</style>
