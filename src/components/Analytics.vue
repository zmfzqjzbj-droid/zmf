<template>
  <div class="analytics">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>任务完成率饼图</span>
          </template>
          <div ref="pieChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>平均时长折线图</span>
          </template>
          <div ref="lineChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import api from '../api'

const pieChartRef = ref()
const lineChartRef = ref()
let pieChart = null
let lineChart = null

// 初始化饼图
const initPieChart = (data) => {
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    title: { text: '任务完成率', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: data.passed_records, name: '已通过', itemStyle: { color: '#67C23A' } },
          { value: data.total_records - data.passed_records, name: '未通过/进行中', itemStyle: { color: '#F56C6C' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

// 初始化折线图（示例数据，可根据实际任务ID扩展）
const initLineChart = (data) => {
  lineChart = echarts.init(lineChartRef.value)
  lineChart.setOption({
    title: { text: '平均完成时长（秒）', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['L1基础', 'L2进阶', 'L3拓展', 'L4复杂', 'L5嵌套'] },
    yAxis: { type: 'value', name: '秒' },
    series: [
      {
        data: [data.avg_duration_seconds * 0.5, data.avg_duration_seconds, data.avg_duration_seconds * 1.5, data.avg_duration_seconds * 2, data.avg_duration_seconds * 2.5],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#409EFF' },
        areaStyle: { color: 'rgba(64, 158, 255, 0.3)' }
      }
    ]
  })
}

// 页面加载时获取统计数据
onMounted(async () => {
  try {
    const res = await api.getAnalytics()
    const data = res.data.data
    initPieChart(data)
    initLineChart(data)
  } catch (err) {
    console.error('获取统计数据失败', err)
  }
})

// 窗口大小变化时，重新渲染图表
const handleResize = () => {
  pieChart && pieChart.resize()
  lineChart && lineChart.resize()
}
window.addEventListener('resize', handleResize)

// 销毁图表
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  pieChart && pieChart.dispose()
  lineChart && lineChart.dispose()
})
</script>