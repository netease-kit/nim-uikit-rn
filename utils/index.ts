import { MockAvatars } from '@/constants/Avatars'

// 用于跟踪已使用的头像索引
let usedAvatarIndices: number[] = []

export const getRandomAvatar = () => {
  // 如果所有头像都已使用，重置已使用列表
  if (usedAvatarIndices.length >= MockAvatars.length) {
    usedAvatarIndices = []
  }

  // 获取可用的头像索引
  const availableIndices = MockAvatars.map((_, index) => index).filter(
    (index) => !usedAvatarIndices.includes(index)
  )

  // 从可用索引中随机选择一个
  const randomIndex = Math.floor(Math.random() * availableIndices.length)
  const selectedIndex = availableIndices[randomIndex]

  // 将选中的索引添加到已使用列表
  usedAvatarIndices.push(selectedIndex)

  return MockAvatars[selectedIndex]
}

// 重置已使用的头像列表（可选的辅助函数）
export const resetUsedAvatars = () => {
  usedAvatarIndices = []
}
