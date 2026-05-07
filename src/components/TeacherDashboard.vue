<template>
  <div class="teacher-container">
    <!-- 顶部导航 -->
    <el-header class="header">
      <h2>教师任务管理中心</h2>
      <div>
        <el-button type="primary" @click="activeTab = 'stats'" size="small">数据统计</el-button>
        <el-button type="danger" @click="logout" size="small">退出登录</el-button>
      </div>
    </el-header>

    <!-- 标签页切换 -->
    <el-main class="main">
      <el-tabs v-model="activeTab" type="card">
        <!-- 标签1：任务组管理 -->
        <el-tab-pane label="任务组管理" name="group">
          <div class="tool-bar">
            <el-button type="primary" @click="createGroup">+ 新建任务组</el-button>
          </div>

          <div class="group-list">
            <el-card v-for="group in groupList" :key="group.group_id" class="group-card">
              <template #header>
                <div class="card-header">
                  <span>{{ group.group_name }}</span>
                  <el-tag :type="group.is_published ? 'success' : 'warning'">
                    {{ group.is_published ? '已发布' : '未发布' }}
                  </el-tag>
                </div>
              </template>

              <div class="card-actions">
                <el-button size="small" type="success" @click="publishGroup(group.group_id)" :disabled="group.is_published">
                  发布给学生
                </el-button>
                <el-button size="small" type="primary" @click="openCardModal(group.group_id)">
                  + 添加任务卡
                </el-button>
                <el-button size="small" type="danger" @click="delGroup(group.group_id)">
                  删除
                </el-button>
              </div>

              <!-- 任务卡列表 -->
              <div class="card-list" v-if="group.cards && group.cards.length">
                <div v-for="card in group.cards" :key="card.card_id" class="card-item">
                  <div class="card-info">
                    <span>{{ card.card_name }}</span>
                    <el-tag :type="getDiffType(card.difficulty)">{{ card.difficulty }}</el-tag>
                  </div>
                  <div class="card-opt">
                    <el-button size="mini" type="primary" @click="editSections(card)">编辑板块</el-button>
                    <el-button size="mini" type="danger" @click="delCard(card.card_id)">删除</el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 标签2：学生任务批改 -->
        <el-tab-pane label="任务批改" name="correct">
          <div class="correct-list">
            <el-card v-for="item in taskSubmitList" :key="item.id" class="correct-card">
              <div class="correct-info">
                <p>学生ID：{{ item.student_id }}</p>
                <p>任务卡：{{ item.card_name }}</p>
                <p>状态：{{ item.status }}</p>
                <p v-if="item.self_summary">自我小结：{{ item.self_summary }}</p>
                <p>提问次数：{{ item.question_count }}</p>
              </div>

              <div class="correct-form" v-if="item.status === '已提交'">
                <el-input v-model="remarkForm.comment" placeholder="输入点评" type="textarea" rows="2"></el-input>
                <el-input v-model.number="remarkForm.score" placeholder="输入分数" style="width:100px;margin:10px 0"></el-input>
                <div>
                  <el-button type="success" size="small" @click="submitRemark(item)">评分完成</el-button>
                  <el-button type="warning" size="small" @click="rejectTask(item)">退回任务</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <!-- 标签3：数据统计 -->
        <el-tab-pane label="数据统计" name="stats">
          <div class="stats-box">
            <el-card v-for="group in groupList" :key="group.group_id" class="stats-card">
              <h4>{{ group.group_name }} - 完成率统计</h4>
              <div v-for="card in group.cards" :key="card.card_id">
                <p>{{ card.card_name }}：{{ card.rate || 0 }}%</p>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-main>

    <!-- 弹窗：新建任务组 -->
    <el-dialog v-model="groupModal" title="新建任务组">
      <el-input v-model="groupForm.group_name" placeholder="输入任务组名称"></el-input>
      <template #footer>
        <el-button @click="groupModal = false">取消</el-button>
        <el-button type="primary" @click="saveGroup">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：新建任务卡 -->
    <el-dialog v-model="cardModal" title="新建任务卡">
      <el-input v-model="cardForm.card_name" placeholder="输入任务卡名称" style="margin-bottom:10px"></el-input>
      <el-radio-group v-model="cardForm.difficulty">
        <el-radio label="基础卡">基础卡</el-radio>
        <el-radio label="提高卡">提高卡</el-radio>
        <el-radio label="挑战卡">挑战卡</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="cardModal = false">取消</el-button>
        <el-button type="primary" @click="saveCard">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：编辑板块 -->
    <el-dialog v-model="sectionModal" title="编辑任务卡板块" width="700px">
      <div v-for="sec in sectionList" :key="sec.section_id" class="section-item">
        <el-input v-model="sec.section_title" placeholder="板块名称" style="width:150px"></el-input>
        <el-input v-model="sec.content" type="textarea" rows="2" placeholder="板块内容" style="margin:0 10px"></el-input>
        <el-input v-model="sec.media_url" placeholder="图片/语音/视频链接"></el-input>
        <el-button size="mini" type="danger" @click="delSection(sec.section_id)">删除</el-button>
      </div>
      <el-button type="primary" size="small" @click="addSection">+ 新增板块</el-button>
      <template #footer>
        <el-button @click="sectionModal = false">关闭</el-button>
        <el-button type="success" @click="saveAllSections">保存所有板块</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as api from '../api.js'
import { getUser, clearUser } from '../store.js'

const router = useRouter()
const user = getUser()
const activeTab = ref('group')

// 任务组
const groupModal = ref(false)
const groupForm = ref({ group_name: '' })
const groupList = ref([])

// 任务卡
const cardModal = ref(false)
const currentGroupId = ref(0)
const cardForm = ref({ card_name: '', difficulty: '基础卡' })

// 板块
const sectionModal = ref(false)
const currentCardId = ref(0)
const sectionList = ref([])

// 批改
const remarkForm = ref({ comment: '', score: 0 })
const taskSubmitList = ref([])

// 加载任务组
const loadGroups = async () => {
  const res = await api.groupList()
  groupList.value = res.data.data
  for (let g of groupList.value) {
    const cardRes = await api.cardList(g.group_id)
    g.cards = cardRes.data.data
  }
}

// 新建任务组
const createGroup = () => {
  groupForm.value = { group_name: '' }
  groupModal.value = true
}
const saveGroup = async () => {
  await api.createGroup({ name: groupForm.value.group_name, teacher_id: user.user_id })
  ElMessage.success('创建成功')
  groupModal.value = false
  loadGroups()
}

// 发布任务组
const publishGroup = async (gid) => {
  await api.publishGroup(gid)
  ElMessage.success('已发布给所有学生')
  loadGroups()
}

// 删除任务组
const delGroup = async (gid) => {
  await api.deleteGroup(gid)
  ElMessage.success('删除成功')
  loadGroups()
}

// 新建任务卡
const openCardModal = (gid) => {
  currentGroupId.value = gid
  cardForm.value = { card_name: '', difficulty: '基础卡' }
  cardModal.value = true
}
const saveCard = async () => {
  await api.createCard({
    group_id: currentGroupId.value,
    card_name: cardForm.value.card_name,
    difficulty: cardForm.value.difficulty
  })
  ElMessage.success('创建成功')
  cardModal.value = false
  loadGroups()
}

// 删除任务卡
const delCard = async (cid) => {
  await api.deleteCard(cid)
  ElMessage.success('删除成功')
  loadGroups()
}

// 编辑板块
const editSections = async (card) => {
  currentCardId.value = card.card_id
  const res = await api.sectionList(card.card_id)
  sectionList.value = res.data.data
  sectionModal.value = true
}
const addSection = () => {
  sectionList.value.push({ section_id: Date.now(), section_title: '', content: '', media_url: '' })
}
const delSection = async (sid) => {
  await api.deleteSection(sid)
  sectionList.value = sectionList.value.filter(s => s.section_id !== sid)
}
const saveAllSections = async () => {
  for (let sec of sectionList.value) {
    await api.saveSection({
      card_id: currentCardId.value,
      title: sec.section_title,
      content: sec.content,
      media: sec.media_url
    })
  }
  ElMessage.success('保存成功')
  sectionModal.value = false
}

// 任务批改
const loadSubmitTasks = async () => {
  // 简化：获取所有已提交任务
  const res = await api.groupList()
  taskSubmitList.value = res.data.data.flatMap(g => g.cards || [])
}

// 评分完成
const submitRemark = async (item) => {
  await api.teacherRemark({
    student_id: item.student_id,
    card_id: item.card_id,
    comment: remarkForm.value.comment,
    score: remarkForm.value.score
  })
  ElMessage.success('评分完成，高难度自动完成低难度')
  loadSubmitTasks()
}

// 退回任务
const rejectTask = async (item) => {
  await api.rejectTask({ student_id: item.student_id, card_id: item.card_id })
  ElMessage.success('已退回')
  loadSubmitTasks()
}

// 难度标签
const getDiffType = (d) => {
  if (d === '基础卡') return 'success'
  if (d === '提高卡') return 'warning'
  return 'danger'
}

// 退出登录
const logout = () => {
  clearUser()
  router.push('/login')
}

onMounted(() => {
  if (!user || user.role !== 'teacher') { router.push('/login'); return }
  loadGroups()
  loadSubmitTasks()
})
</script>

<style scoped>
.teacher-container {
  min-height: 100vh;
  background: #f5f7fa;
}
.header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.main {
  padding: 20px;
}
.tool-bar {
  margin-bottom: 20px;
}
.group-card, .correct-card, .stats-card {
  margin-bottom: 15px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.section-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>