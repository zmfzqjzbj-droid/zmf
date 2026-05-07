<template>
  <div class="create-task">
    <el-card>
      <template #header>
        <span>创建新任务卡</span>
      </template>
      
      <el-form :model="form" label-width="100px">
        <el-form-item label="任务标题">
          <el-input v-model="form.task_title" placeholder="请输入任务标题"></el-input>
        </el-form-item>
        
        <el-form-item label="难度等级">
          <el-select v-model="form.difficulty_level" placeholder="请选择难度">
            <el-option label="L1基础" value="L1基础"></el-option>
            <el-option label="L2进阶" value="L2进阶"></el-option>
            <el-option label="L3拓展" value="L3拓展"></el-option>
            <el-option label="L4复杂" value="L4复杂"></el-option>
            <el-option label="L5嵌套" value="L5嵌套"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="情境描述">
          <!-- wangEditor富文本编辑器 -->
          <div style="border: 1px solid #ccc;">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <Editor
              style="height: 200px; overflow-y: hidden;"
              v-model="form.situation_desc"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="知识提示">
          <div style="border: 1px solid #ccc;">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef2"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <Editor
              style="height: 200px; overflow-y: hidden;"
              v-model="form.knowledge_tips"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated2"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="多媒体链接">
          <el-input v-model="form.media_url" placeholder="请输入视频/图片链接"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">创建任务卡</el-button>
          <el-button @click="form = {}">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import api from '../api'

// 表单数据
const form = ref({
  task_title: '',
  difficulty_level: '',
  situation_desc: '',
  knowledge_tips: '',
  media_url: ''
})

// wangEditor配置
const editorRef = ref()
const editorRef2 = ref()
const mode = ref('default')
const toolbarConfig = ref({})
const editorConfig = ref({
  placeholder: '请输入内容...'
})

const handleCreated = (editor) => {
  editorRef.value = editor
}
const handleCreated2 = (editor) => {
  editorRef2.value = editor
}

// 及时销毁编辑器，避免内存泄漏
onBeforeUnmount(() => {
  const editor = editorRef.value
  const editor2 = editorRef2.value
  if (editor == null) return
  if (editor2 == null) return
  editor.destroy()
  editor2.destroy()
})

// 提交创建
const handleSubmit = async () => {
  if (!form.value.task_title || !form.value.difficulty_level) {
    ElMessage.warning('请填写必填项')
    return
  }
  try {
    await api.createTask(form.value)
    ElMessage.success('任务卡创建成功！')
    form.value = {}
  } catch (err) {
    ElMessage.error('创建失败，请检查服务')
  }
}
</script>