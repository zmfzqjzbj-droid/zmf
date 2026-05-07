import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 登录接口
export const login = (data) => {
  return api.post('/api/login', data)
}

// 注册接口
export const register = (data) => {
  return api.post('/api/register', data)
}

// 任务组列表
export const groupList = () => {
  return api.get('/api/group/list')
}

// 任务卡列表
export const cardList = (groupId) => {
  return api.get(`/api/card/list/${groupId}`)
}

// 领取任务卡
export const claimTask = (data) => {
  return api.post('/api/student/claim', data)
}

// 退回任务卡
export const returnTask = (data) => {
  return api.post('/api/student/return', data)
}

// 提交任务卡
export const submitTask = (data) => {
  return api.post('/api/student/submit', data)
}

// 提交自我小结
export const submitSummary = (data) => {
  return api.post('/api/student/summary', data)
}

// 提交提问
export const addQuestion = (data) => {
  return api.post('/api/question/add', data)
}

// 学生数据统计
export const studentAnalytics = (studentId) => {
  return api.get(`/api/analytics/student/${studentId}`)
}

// 教师：创建任务组
export const createGroup = (data) => {
  return api.post('/api/group/create', data)
}

// 教师：发布任务组
export const publishGroup = (groupId) => {
  return api.post(`/api/group/publish/${groupId}`)
}

// 教师：删除任务组
export const deleteGroup = (groupId) => {
  return api.post(`/api/group/delete/${groupId}`)
}

// 教师：创建任务卡
export const createCard = (data) => {
  return api.post('/api/card/create', data)
}

// 教师：删除任务卡
export const deleteCard = (cardId) => {
  return api.post(`/api/card/delete/${cardId}`)
}

// 教师：保存板块内容
export const saveSection = (data) => {
  return api.post('/api/section/save', data)
}

// 教师：获取板块列表
export const sectionList = (cardId) => {
  return api.get(`/api/section/list/${cardId}`)
}

// 教师：删除板块
export const deleteSection = (sectionId) => {
  return api.post(`/api/section/delete/${sectionId}`)
}

// 教师：点评评分任务
export const teacherRemark = (data) => {
  return api.post('/api/teacher/remark', data)
}

// 教师：退回任务
export const rejectTask = (data) => {
  return api.post('/api/teacher/reject', data)
}

// 教师：任务组数据统计
export const groupAnalytics = (groupId) => {
  return api.get(`/api/analytics/group/${groupId}`)
}
// 【新增】文件上传接口（图片/视频）
export const uploadFile = (file) => {
  // 创建 FormData 对象，用于文件上传
  const formData = new FormData()
  formData.append('file', file) // 'file' 是后端接收文件的字段名，根据你的后端实际字段名修改

  return api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data' // 必须设置为 multipart/form-data
    }
  })
}
export default api