<script setup>
import { ref, onMounted, computed } from 'vue'
import exampleData from './example'
import SimpleWordCloud from 'simple-word-cloud'
import { fontFamilyList, colorsList, transitionList } from './constant'
import { ElMessage } from 'element-plus'

const wordStr = ref(
  exampleData
    .map(item => {
      return item[0] + ' ' + item[1]
    })
    .join('\n')
)

const lastRenderType = ref('DOM')
const renderType = ref('DOM')
const rotateType = ref('none')
const minFontSize = ref(12)
const maxFontSize = ref(40)
const fontFamily = ref('微软雅黑, Microsoft YaHei')
const italic = ref(false)
const space = ref(0)
const colorIndex = ref(0)
const colorList = computed(() => {
  return colorsList[colorIndex.value]
})
const transition = ref('ease')

const el = ref(null)
const duration = ref(0)

// 词云实例
let wordCloud = null

// 生成文本列表
const createWordList = () => {
  return wordStr.value.split(/\n/).map(item => {
    const arr = item.split(/\s+/)
    return [arr[0], arr[1]]
  })
}

// 渲染
const render = () => {
  if (lastRenderType.value !== renderType.value) {
    lastRenderType.value = renderType.value
    wordCloud.clear()
  }
  duration.value = 0
  const startTime = Date.now()
  wordCloud.updateOption({
    rotateType: rotateType.value,
    minFontSize: minFontSize.value,
    maxFontSize: maxFontSize.value,
    fontFamily: fontFamily.value,
    fontStyle: italic.value ? 'italic' : '',
    space: space.value,
    colorList: colorList.value,
    transition: 'all 0.5s ' + transition.value,
    onClick: item => {
      ElMessage('点击了' + item.text)
    }
  })
  wordCloud[renderType.value === 'DOM' ? 'render' : 'renderUseCanvas'](
    createWordList(),
    res => {
      const endTime = Date.now()
      duration.value = (endTime - startTime) / 1000
    }
  )
}

// 下载
const download = () => {
  wordCloud.exportCanvas()
}

onMounted(() => {
  wordCloud = new SimpleWordCloud({
    el: el.value
  })
  render()

  let timer = null
  window.addEventListener('resize', () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      wordCloud.resize()
      render()
    }, 300)
  })
})
</script>

<template>
  <div class="wordCloudContainer">
    <div class="sidebar">
      <div class="duration">共耗时：{{ duration }}秒</div>
      <div class="optionBox">
        <el-input
          v-model="wordStr"
          :rows="15"
          type="textarea"
          placeholder="一行代表一个词，词和权重用空格分隔"
        />
        <h3>渲染方式</h3>
        <div class="row">
          <el-radio-group v-model="renderType">
            <el-radio-button label="DOM">DOM</el-radio-button>
            <el-radio-button label="Canvas">Canvas</el-radio-button>
          </el-radio-group>
        </div>
        <h3>旋转</h3>
        <div class="row">
          <el-radio-group v-model="rotateType">
            <el-radio-button label="none">无</el-radio-button>
            <el-radio-button label="cross">交叉</el-radio-button>
            <el-radio-button label="oblique">倾斜</el-radio-button>
            <el-radio-button label="random">随机</el-radio-button>
          </el-radio-group>
        </div>
        <h3>字体</h3>
        <div class="row">
          <el-select v-model="fontFamily">
            <el-option
              v-for="item in fontFamilyList"
              :key="item"
              :label="item"
              :value="item"
            >
              <span :style="{ fontFamily: item }">{{ item }}</span>
            </el-option>
          </el-select>
        </div>
        <h3>色系</h3>
        <div class="row">
          <el-radio-group v-model="colorIndex">
            <el-radio-button
              class="colorRadio"
              v-for="(list, index) in colorsList"
              :key="index"
              :label="index"
            >
              <div class="colorList">
                <div
                  class="colorItem"
                  v-for="color in list"
                  :key="color"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
            </el-radio-button>
          </el-radio-group>
        </div>
        <h3 v-if="renderType === 'DOM'">动画</h3>
        <div class="row" v-if="renderType === 'DOM'">
          <el-select v-model="transition">
            <el-option
              v-for="item in transitionList"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </div>
        <h3>间距比例</h3>
        <div class="row">
          <el-slider v-model="space" :max="1" :step="0.1" />
        </div>
        <h3>斜体</h3>
        <div class="row">
          <el-switch v-model="italic" />
        </div>
        <h3>字号</h3>
        <div class="row">
          最小：<el-input-number v-model="minFontSize" :min="12" :max="100" />
        </div>
        <div class="row">
          最大：<el-input-number
            v-model="maxFontSize"
            :min="minFontSize"
            :max="100"
          />
        </div>
      </div>
      <div class="btnBox">
        <el-button type="primary" style="width: 100px" @click="render"
          >确定</el-button
        >
      </div>
    </div>
    <div class="content">
      <el-button
        v-if="renderType === 'Canvas'"
        type="primary"
        style="position: absolute; left: 10px; top: 10px"
        @click="download"
        >下载</el-button
      >
      <div class="wordCloud" ref="el">
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
    </div>
  </div>
</template>

<style scoped lang="less">
.wordCloudContainer {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;

  .sidebar {
    width: 300px;
    height: 100%;
    flex-shrink: 0;
    border-right: 1px solid rgba(60, 60, 60, 0.12);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .duration {
      text-align: center;
      height: 50px;
      line-height: 50px;
      color: #213547;
      font-weight: bold;
      border-bottom: 1px solid rgba(60, 60, 60, 0.12);
      flex-shrink: 0;
    }

    .optionBox {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px;

      h3 {
        margin: 12px 0;
      }

      .row {
        margin-bottom: 12px;

        /deep/ .colorRadio {
          .el-radio-button__inner {
            padding: 5px;
          }
        }

        .colorList {
          width: 35px;
          display: flex;
          height: 30px;

          .colorItem {
            width: 100%;
            height: 100%;
          }
        }
      }
    }

    .btnBox {
      width: 100%;
      height: 50px;
      border-top: 1px solid rgba(60, 60, 60, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .content {
    width: 100%;
    height: 100%;
    padding: 50px;
    position: relative;

    .wordCloud {
      width: 100%;
      height: 100%;

      .wordItemDot {
        position: absolute;
        width: 5px;
        height: 5px;
        border-radius: 50%;
      }
    }
  }
}
</style>
