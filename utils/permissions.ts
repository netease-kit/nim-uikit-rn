import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'
import { Alert } from 'react-native'

type PermissionKind = '相机' | '相册'

async function openSettingsAlert(permissionKind: PermissionKind) {
  return new Promise<boolean>((resolve) => {
    Alert.alert('权限不足', `请在设置页面添加${permissionKind}权限`, [
      {
        text: '取消',
        style: 'cancel',
        onPress: () => resolve(false)
      },
      {
        text: '去设置',
        onPress: async () => {
          await Linking.openSettings()
          resolve(false)
        }
      }
    ])
  })
}

export async function ensureCameraPermission() {
  const permission = await ImagePicker.requestCameraPermissionsAsync()

  if (permission.granted) {
    return true
  }

  if (!permission.canAskAgain) {
    await openSettingsAlert('相机')
    return false
  }

  Alert.alert('权限不足', '请在设置页面添加相机权限')
  return false
}

export async function ensureMediaLibraryPermission() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

  if (permission.granted || permission.accessPrivileges === 'limited') {
    return true
  }

  if (!permission.canAskAgain) {
    await openSettingsAlert('相册')
    return false
  }

  Alert.alert('权限不足', '请在设置页面添加相册权限')
  return false
}
