<script setup>
import { ref, onMounted } from 'vue'
import exampleData from './example'
import SimpleWordCloud from 'simple-word-cloud'

const startTime = Date.now()

const el = ref(null)
const list = ref([])
const duration = ref(0)

onMounted(() => {
  const wordCloud = new SimpleWordCloud({
    el: el.value
    // space: 0.2,
    // minFontSize: 30,
    // maxFontSize: 40,
    // fontWeight: 'bold',
    // fontSizeScale: 0.1,
    // colorList: []
  })
  wordCloud.run(
    exampleData.map(item => {
      return [
        ...item,
        {
          // rotate: -45,
          rotate: Math.random() > 0.5 ? -90 : 0
          // rotate: Math.floor(Math.random() * 360),
          // space: 0,
          // fontFamily: '',
          // fontWeight: '',
          // color: ''
        }
      ]
    }),
    res => {
      list.value = res
      console.log(list.value)

      const endTime = Date.now()
      duration.value = (endTime - startTime) / 1000
    }
  )
})
</script>

<template>
  <div>共耗时：{{ duration }}秒</div>
  <div class="container" ref="el">
    <div
      class="wordItemWrap"
      v-for="(item, index) in list"
      :key="index"
      :style="{
        left: item.left + 'px',
        top: item.top + 'px',
        width: item.width + 'px',
        height: item.height + 'px'
      }"
    >
      <div
        class="wordItem"
        :style="{
          fontSize: item.fontStyle.fontSize + 'px',
          fontFamily: item.fontStyle.fontFamily,
          fontWeight: item.fontStyle.fontWeight,
          color: item.color,
          transform: `rotate(${item.rotate}deg)`
        }"
      >
        {{ item.text }}
      </div>
    </div>
    <!-- <div
      class="wordItemDot"
      v-for="(item, index) in list"
      :key="index"
      :style="{
        left: item.left + 'px',
        top: item.top + 'px',
        backgroundColor: item.color
      }"
    ></div> -->
  </div>
</template>

<style scoped lang="less">
.container {
  width: 600px;
  height: 400px;
  border: 1px solid #000;
  margin: 200px auto;
  position: relative;

  .wordItemWrap {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;

    .wordItem {
      white-space: nowrap;
    }
  }

  .wordItemDot {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
}
</style>
