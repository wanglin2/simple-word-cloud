<script setup>
import { ref, watch, onMounted } from 'vue'
import exampleData from './example'
import WordCloud from './WordCloud'

const startTime = Date.now()

const el = ref(null)
const list = ref([])
const duration = ref(0)

onMounted(() => {
  const wordCloud = new WordCloud({
    el: el.value,
    // minFontSize: 30,
    // maxFontSize: 40
  })
  wordCloud.start(exampleData, res => {
    list.value = res
    console.log(list.value)

    const endTime = Date.now()
    duration.value = (endTime - startTime) / 1000
  })
})
</script>

<template>
  <div>共耗时：{{ duration }}秒</div>
  <div class="container" ref="el">
    <div
      class="wordItem"
      v-for="(item, index) in list"
      :key="index"
      :style="{
        left: item.left + 'px',
        top: item.top + 'px',
        fontSize: item.fontStyle.fontSize + 'px',
        fontFamily: item.fontStyle.fontFamily,
        fontWeight: item.fontStyle.fontWeight,
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
