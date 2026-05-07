// 用户信息存储
export const setUser = (user) => {
  localStorage.setItem('task_user', JSON.stringify(user))
}

export const getUser = () => {
  const u = localStorage.getItem('task_user')
  return u ? JSON.parse(u) : null
}

export const clearUser = () => {
  localStorage.removeItem('task_user')
}
