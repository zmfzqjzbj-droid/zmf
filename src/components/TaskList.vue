<template>
  <div class="task-list">
    <el-row :gutter="20">
      <!-- 循环渲染每一张任务卡 -->
      <el-col :span="8" v-for="task in tasks" :key="task.task_id" style="margin-bottom: 20px;">
        <el-card :body-style="{ padding: '20px' }" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ task.task_title }}</span>
              <el-tag :type="getTagType(task.difficulty_level)">{{ task.difficulty_level }}</el-tag>
            </div>
          </template>
          
          <p><strong>情境描述：</strong>{{ task.situation_desc }}</p>
          <p><strong>知识提示：</strong>{{ task.knowledge_tips }}</p>
          
          <template #footer>
            <div class="card-footer">
              <span>创建时间：{{ task.create_time }}</span>
              <el-button type="primary" size="small" @click="handleClaim(task.task_id)">领取任务</el-button>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 空状态提示 -->
    <el-empty v-if="tasks.length === 0" description="暂无任务卡，请先创建"></el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api'

const tasks = ref([])

// 根据难度返回标签颜色
const getTagType = (level) => {
  const map = {
    'L1基础': 'success',
    'L2进阶': 'warning',
    'L3拓展': 'danger',
    'L4复杂': 'info',
    'L5嵌套': ''
  }
  return map[level] || ''
}

// 领取任务
const handleClaim = async (taskId) => {
  try {
    const res = await api.claimTask({ user_id: 1, task_id: taskId })
    ElMessage.success(`任务领取成功！记录ID：${res.data.record_id}`)
  } catch (err) {
    ElMessage.error('领取失败，请检查服务')
  }
}

// 页面加载时获取任务卡列表
onMounted(async () => {
  try {
    const res = await api.getTasks()
    tasks.value = res.data.data
  } catch (err) {
    ElMessage.error('获取任务卡失败，请检查Flask服务是否启动')
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>