<template>
  <div class="student-dashboard">
    <el-header class="header">
      <div class="header-content">
        <h2>学生任务中心</h2>
        <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </el-header>
    <el-main class="main-content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="taskGroups.length === 0" class="empty-tip">暂无发布的任务组</div>
      <div v-else class="task-group-list">
        <div v-for="group in taskGroups" :key="group.group_id" class="task-group-card">
          <h3>{{ group.group_name }}</h3>
          <div class="task-card-list">
            <el-card v-for="card in group.cards" :key="card.card_id" class="task-card">
              <template #header>
                <div class="card-header">
                  <span>{{ card.card_name }}</span>
                  <el-tag :type="getDifficultyTag(card.difficulty)">{{ card.difficulty }}</el-tag>
                </div>
              </template>
              <p class="card-status">状态：{{ getCardStatus(card.status) }}</p>
              
              <!-- 按钮根据状态动态显示 -->
              <el-button 
                v-if="card.status === '未开始'" 
                type="primary" 
                size="small" 
                @click="handleClaimTask(card.card_id)"
              >
                领取任务
              </el-button>
              <el-button 
                v-else-if="card.status === '进行中'" 
                type="success" 
                size="small" 
                @click="openTaskDetail(card)"
              >
                编辑/提交任务
              </el-button>
              <el-button 
                v-else-if="card.status === '已提交'" 
                type="info" 
                size="small" 
                @click="openTaskDetail(card, true)"
              >
                查看提交详情
              </el-button>
              <el-button 
                v-else-if="card.status === '进行中'" 
                type="warning" 
                size="small" 
                @click="handleReturnTask(card.card_id)"
              >
                退回任务
              </el-button>
            </el-card>
          </div>
        </div>
      </div>
    </el-main>

    <!-- 任务详情/编辑弹窗 -->
    <el-dialog 
      v-model="taskDetailModal" 
      :title="isViewOnly ? '任务详情' : '编辑任务'" 
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="task-base-info">
        <p><strong>任务名称：</strong>{{ currentTask.card_name }}</p>
        <p><strong>任务难度：</strong>{{ currentTask.difficulty }}</p>
        <p><strong>当前状态：</strong>{{ getCardStatus(currentTask.status) }}</p>
      </div>

      <el-divider content-position="left">任务内容编辑</el-divider>
      
      <!-- 文字内容输入 -->
      <el-form-item label="任务文字内容">
        <el-input 
          v-model="taskForm.content" 
          type="textarea" 
          :rows="6" 
          placeholder="请输入你的任务完成内容、解题步骤、心得体会等..."
          :disabled="isViewOnly"
        ></el-input>
      </el-form-item>

      <!-- 图片/视频上传（支持拖拽+本地选择） -->
      <el-form-item label="图片/视频附件">
        <el-upload
          class="upload-dragger"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
          :disabled="isViewOnly"
          accept="image/*,video/*"
          multiple
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击选择图片/视频</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 jpg/png/mp4 格式，可多选，提交后会自动上传到服务器
            </div>
          </template>
        </el-upload>

        <!-- 文件预览 -->
        <div class="file-preview" v-if="fileList.length > 0">
          <div v-for="file in fileList" :key="file.uid" class="preview-item">
            <!-- 图片预览 -->
            <img v-if="file.raw.type.indexOf('image/') === 0" :src="file.url" alt="预览图" />
            <!-- 视频预览 -->
            <video v-else-if="file.raw.type.indexOf('video/') === 0" :src="file.url" controls></video>
            <span class="file-name">{{ file.name }}</span>
            <!-- 上传状态显示 -->
            <el-tag v-if="file.uploadStatus === 'uploading'" type="warning" size="small">上传中...</el-tag>
            <el-tag v-else-if="file.uploadStatus === 'success'" type="success" size="small">上传成功</el-tag>
            <el-tag v-else-if="file.uploadStatus === 'error'" type="danger" size="small">上传失败</el-tag>
          </div>
        </div>
      </el-form-item>

      <template #footer>
        <el-button @click="taskDetailModal = false">关闭</el-button>
        <el-button 
          v-if="!isViewOnly" 
          type="primary" 
          @click="submitTask"
          :loading="submitLoading"
        >
          提交任务
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import * as api from '../api.js'
import { getUser, clearUser } from '../store.js'

const router = useRouter()
const user = getUser()
const loading = ref(true)
const submitLoading = ref(false)
const taskGroups = ref([])

// 任务详情弹窗相关
const taskDetailModal = ref(false)
const isViewOnly = ref(false)
const currentTask = ref({})
const fileList = ref([])
const taskForm = reactive({
  content: '',
  uploadedFiles: [] // 存储上传成功后的线上文件地址
})

// 难度标签样式
const getDifficultyTag = (difficulty) => {
  if (difficulty === '基础卡') return 'success'
  if (difficulty === '提高卡') return 'warning'
  if (difficulty === '挑战卡') return 'danger'
  return 'info'
}

// 任务状态显示
const getCardStatus = (status) => {
  switch(status) {
    case '未开始': return '未领取'
    case '进行中': return '已领取（进行中）'
    case '已提交': return '已提交待批改'
    case '已完成': return '已完成'
    default: return status
  }
}

// 加载学生任务组和任务卡
const loadStudentTasks = async () => {
  console.log("1. 开始加载任务组...")
  loading.value = true
  try {
    // 获取所有已发布的任务组
    const groupRes = await api.groupList()
    console.log("2. 任务组接口返回：", groupRes.data)
    
    const allGroups = groupRes.data.data.filter(g => g.is_published)
    console.log("3. 过滤后的已发布任务组：", allGroups)
    
    // 给每个任务组加载任务卡
    for (const group of allGroups) {
      const cardRes = await api.cardList(group.group_id)
      console.log(`任务组${group.group_id}的任务卡：`, cardRes.data)
      
      // 给任务卡补充状态信息
      group.cards = cardRes.data.data.map(card => ({
        ...card,
        status: '未开始' // 后续可对接后端学生任务记录，替换为真实状态
      }))
    }
    taskGroups.value = allGroups
    console.log("4. 最终任务列表：", taskGroups.value)
  } catch (err) {
    console.error("加载任务出错：", err)
    ElMessage.error('加载任务失败：' + err.message)
  } finally {
    loading.value = false
  }
}

// 领取任务
const handleClaimTask = async (cardId) => {
  try {
    await api.claimTask({ student_id: user.user_id, card_id: cardId })
    ElMessage.success('任务领取成功！')
    // 领取后更新任务状态为进行中
    taskGroups.value.forEach(group => {
      group.cards.forEach(card => {
        if (card.card_id === cardId) {
          card.status = '进行中'
        }
      })
    })
  } catch (err) {
    ElMessage.error(err.response?.data?.msg || '领取失败')
  }
}

// 退回任务
const handleReturnTask = async (cardId) => {
  try {
    await api.returnTask({ student_id: user.user_id, card_id: cardId })
    ElMessage.success('任务已退回')
    // 退回后更新任务状态为未开始
    taskGroups.value.forEach(group => {
      group.cards.forEach(card => {
        if (card.card_id === cardId) {
          card.status = '未开始'
        }
      })
    })
  } catch (err) {
    ElMessage.error(err.response?.data?.msg || '退回失败')
  }
}

// 打开任务详情弹窗
const openTaskDetail = (card, viewOnly = false) => {
  currentTask.value = card
  isViewOnly.value = viewOnly
  taskForm.content = ''
  fileList.value = []
  taskForm.uploadedFiles = []
  taskDetailModal.value = true
}

// 处理文件选择/拖拽
const handleFileChange = (file, fileListAll) => {
  // 给文件生成本地预览地址
  file.url = URL.createObjectURL(file.raw)
  file.uploadStatus = 'pending' // 初始状态：待上传
  fileList.value = fileListAll
}

// 处理文件删除
const handleFileRemove = (file, fileListAll) => {
  fileList.value = fileListAll
}

// 【核心】上传单个文件到后端
const uploadSingleFile = async (file) => {
  try {
    file.uploadStatus = 'uploading'
    const res = await api.uploadFile(file.raw)
    
    // 假设后端返回格式：{ code:200, data: { url: "https://xxx.com/xxx.jpg" } }
    if (res.data.code === 200) {
      file.uploadStatus = 'success'
      // 保存线上地址
      taskForm.uploadedFiles.push({
        name: file.name,
        url: res.data.data.url // 根据你的后端返回字段名修改
      })
      return true
    } else {
      file.uploadStatus = 'error'
      return false
    }
  } catch (err) {
    console.error(`文件 ${file.name} 上传失败：`, err)
    file.uploadStatus = 'error'
    return false
  }
}

// 提交任务
const submitTask = async () => {
  if (!taskForm.content.trim()) {
    ElMessage.warning('请输入任务内容后再提交！')
    return
  }

  submitLoading.value = true
  try {
    // 1. 先上传所有选择的文件
    if (fileList.value.length > 0) {
      ElMessage.info('正在上传文件，请稍候...')
      
      // 并发上传所有文件
      const uploadPromises = fileList.value.map(file => uploadSingleFile(file))
      const results = await Promise.all(uploadPromises)
      
      // 检查是否有文件上传失败
      const hasFail = results.some(r => r === false)
      if (hasFail) {
        ElMessage.error('部分文件上传失败，请重试或删除失败的文件')
        submitLoading.value = false
        return
      }
    }

    // 2. 所有文件上传成功后，提交任务
    await api.submitTask({
      student_id: user.user_id,
      card_id: currentTask.value.card_id,
      content: taskForm.content,
      // 传递后端返回的线上文件地址
      attachments: taskForm.uploadedFiles
    })

    ElMessage.success('任务提交成功！等待教师批改')
    taskDetailModal.value = false
    
    // 更新任务状态为已提交
    taskGroups.value.forEach(group => {
      group.cards.forEach(card => {
        if (card.card_id === currentTask.value.card_id) {
          card.status = '已提交'
        }
      })
    })

    // 清空表单
    taskForm.content = ''
    fileList.value = []
    taskForm.uploadedFiles = []
  } catch (err) {
    console.error('提交任务出错：', err)
    ElMessage.error(err.response?.data?.msg || '提交失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 退出登录
const handleLogout = () => {
  clearUser()
  router.push('/login')
}

onMounted(() => {
  console.log("页面挂载，当前用户：", user)
  if (!user || user.role !== 'student') {
    router.push('/login')
    return
  }
  loadStudentTasks()
})
</script>

<style scoped>
.student-dashboard {
  min-height: 100vh;
  background-color: #f5f7fa;
}
.header {
  background: #fff;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.main-content {
  padding: 20px;
}
.task-group-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}
.task-card-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.task-card {
  width: 320px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-status {
  color: #666;
  margin: 10px 0;
}
.empty-tip, .loading {
  text-align: center;
  padding: 50px;
  color: #999;
}
.task-base-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 6px;
}
.task-base-info p {
  margin: 5px 0;
}
.upload-dragger {
  width: 100%;
}
.file-preview {
  margin-top: 15px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}
.preview-item {
  width: 180px;
  text-align: center;
}
.preview-item img, .preview-item video {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 5px;
}
.file-name {
  font-size: 12px;
  color: #666;
  word-break: break-all;
  display: block;
  margin-bottom: 5px;
}
</style>