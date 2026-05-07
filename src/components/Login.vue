<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <span>{{ isLogin ? '用户登录' : '账号注册' }}</span>
      </template>
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.user_name" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item v-if="!isLogin" label="选择身份">
          <!-- 修复单选框弃用警告：用value绑定值，label是显示文本 -->
          <el-radio-group v-model="form.user_role">
            <el-radio value="student">学生</el-radio>
            <el-radio value="teacher">教师</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="button" @click="handleSubmit">
            {{ isLogin ? '立即登录' : '完成注册' }}
          </el-button>
          <el-button native-type="button" @click="isLogin = !isLogin">
            {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 关键修复：用 * as api 导入所有命名导出的接口函数
import * as api from '../api.js'
import { setUser } from '../store.js'

const router = useRouter()
const isLogin = ref(true)
const form = ref({
  user_name: '',
  password: '',
  user_role: 'student'
})

const handleSubmit = async () => {
  if (!form.value.user_name || !form.value.password) {
    ElMessage.warning('请输入用户名和密码！')
    return
  }

  try {
    if (isLogin.value) {
      // 登录逻辑
      const res = await api.login(form.value)
      
      if (res.data.code === 200) {
        const userData = {
          user_id: res.data.data.user_id,
          role: res.data.data.role
        }
        setUser(userData)
        ElMessage.success('登录成功！')
        
        const role = res.data.data.role
        if (role === 'teacher') {
          router.push('/teacher')
        } else if (role === 'student') {
          router.push('/student')
        } else {
          ElMessage.error('角色异常，请重新登录')
        }
      } else {
        ElMessage.error(res.data.msg || '登录失败')
      }
    } else {
      // 注册逻辑
      const res = await api.register(form.value)
      if (res.data.code === 200) {
        ElMessage.success('注册成功！请登录')
        isLogin.value = true
        // 注册成功清空表单
        form.value = {
          user_name: '',
          password: '',
          user_role: 'student'
        }
      } else {
        ElMessage.error(res.data.msg || '注册失败')
      }
    }
  } catch (err) {
    console.error('错误详情：', err)
    ElMessage.error('网络异常，请检查后端服务是否启动')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  background-color: #f5f7fa;
}
.login-card {
  width: 420px;
  padding: 20px;
}
</style>