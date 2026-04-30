import { Image } from 'expo-image'
import React from 'react'
import { ImageStyle, StyleProp } from 'react-native'

import IconA1 from '../static/icons/icon-a-1.png'
import IconA2 from '../static/icons/icon-a-2.png'
import IconA3 from '../static/icons/icon-a-3.png'
import IconA4 from '../static/icons/icon-a-4.png'
import IconA5 from '../static/icons/icon-a-5.png'
import IconA6 from '../static/icons/icon-a-6.png'
import IconA7 from '../static/icons/icon-a-7.png'
import IconA8 from '../static/icons/icon-a-8.png'
import IconA9 from '../static/icons/icon-a-9.png'
import IconA10 from '../static/icons/icon-a-10.png'
import IconA11 from '../static/icons/icon-a-11.png'
import IconA12 from '../static/icons/icon-a-12.png'
import IconA13 from '../static/icons/icon-a-13.png'
import IconA14 from '../static/icons/icon-a-14.png'
import IconA15 from '../static/icons/icon-a-15.png'
import IconA16 from '../static/icons/icon-a-16.png'
import IconA17 from '../static/icons/icon-a-17.png'
import IconA18 from '../static/icons/icon-a-18.png'
import IconA19 from '../static/icons/icon-a-19.png'
import IconA20 from '../static/icons/icon-a-20.png'
import IconA21 from '../static/icons/icon-a-21.png'
import IconA22 from '../static/icons/icon-a-22.png'
import IconA23 from '../static/icons/icon-a-23.png'
import IconA24 from '../static/icons/icon-a-24.png'
import IconA25 from '../static/icons/icon-a-25.png'
import IconA26 from '../static/icons/icon-a-26.png'
import IconA27 from '../static/icons/icon-a-27.png'
import IconA28 from '../static/icons/icon-a-28.png'
import IconA29 from '../static/icons/icon-a-29.png'
import IconA30 from '../static/icons/icon-a-30.png'
import IconA31 from '../static/icons/icon-a-31.png'
import IconA32 from '../static/icons/icon-a-32.png'
import IconA33 from '../static/icons/icon-a-33.png'
import IconA34 from '../static/icons/icon-a-34.png'
import IconA35 from '../static/icons/icon-a-35.png'
import IconA36 from '../static/icons/icon-a-36.png'
import IconA37 from '../static/icons/icon-a-37.png'
import IconA38 from '../static/icons/icon-a-38.png'
import IconA39 from '../static/icons/icon-a-39.png'
import IconA40 from '../static/icons/icon-a-40.png'
import IconA41 from '../static/icons/icon-a-41.png'
import IconA42 from '../static/icons/icon-a-42.png'
import IconA43 from '../static/icons/icon-a-43.png'
import IconA44 from '../static/icons/icon-a-44.png'
import IconA45 from '../static/icons/icon-a-45.png'
import IconA46 from '../static/icons/icon-a-46.png'
import IconA47 from '../static/icons/icon-a-47.png'
import IconA48 from '../static/icons/icon-a-48.png'
import IconA49 from '../static/icons/icon-a-49.png'
import IconA50 from '../static/icons/icon-a-50.png'
import IconA51 from '../static/icons/icon-a-51.png'
import IconA52 from '../static/icons/icon-a-52.png'
import IconA53 from '../static/icons/icon-a-53.png'
import IconA54 from '../static/icons/icon-a-54.png'
import IconA55 from '../static/icons/icon-a-55.png'
import IconA56 from '../static/icons/icon-a-56.png'
import IconA57 from '../static/icons/icon-a-57.png'
import IconA58 from '../static/icons/icon-a-58.png'
import IconA59 from '../static/icons/icon-a-59.png'
import IconA60 from '../static/icons/icon-a-60.png'
import IconA61 from '../static/icons/icon-a-61.png'
import IconA62 from '../static/icons/icon-a-62.png'
import IconA63 from '../static/icons/icon-a-63.png'
import IconA64 from '../static/icons/icon-a-64.png'
import IconA65 from '../static/icons/icon-a-65.png'
import IconA66 from '../static/icons/icon-a-66.png'
import IconA67 from '../static/icons/icon-a-67.png'
import IconA68 from '../static/icons/icon-a-68.png'
import IconA70 from '../static/icons/icon-a-70.png'

const iconSources = {
  logo: require('../static/logo.png'),
  'send-more': require('../static/send-more.png'),
  sending: require('../static/icons/sending.png'),
  'toolbar-voice': require('../static/audio.png'),
  'tab-conversation': require('../static/conversation.png'),
  'tab-conversation-selected': require('../static/conversation-selected.png'),
  'tab-contact': require('../static/contact.png'),
  'tab-contact-selected': require('../static/contact-selected.png'),
  'tab-me': require('../static/me.png'),
  'tab-me-selected': require('../static/me-selected.png'),
  'icon-More': require('../static/icons/icon-More.png'),
  'icon-more': require('../static/icons/icon-More.png'),
  'icon-a-1': IconA1,
  'icon-a-2': IconA2,
  'icon-a-3': IconA3,
  'icon-a-4': IconA4,
  'icon-a-5': IconA5,
  'icon-a-6': IconA6,
  'icon-a-7': IconA7,
  'icon-a-8': IconA8,
  'icon-a-9': IconA9,
  'icon-a-10': IconA10,
  'icon-a-11': IconA11,
  'icon-a-12': IconA12,
  'icon-a-13': IconA13,
  'icon-a-14': IconA14,
  'icon-a-15': IconA15,
  'icon-a-16': IconA16,
  'icon-a-17': IconA17,
  'icon-a-18': IconA18,
  'icon-a-19': IconA19,
  'icon-a-20': IconA20,
  'icon-a-21': IconA21,
  'icon-a-22': IconA22,
  'icon-a-23': IconA23,
  'icon-a-24': IconA24,
  'icon-a-25': IconA25,
  'icon-a-26': IconA26,
  'icon-a-27': IconA27,
  'icon-a-28': IconA28,
  'icon-a-29': IconA29,
  'icon-a-30': IconA30,
  'icon-a-31': IconA31,
  'icon-a-32': IconA32,
  'icon-a-33': IconA33,
  'icon-a-34': IconA34,
  'icon-a-35': IconA35,
  'icon-a-36': IconA36,
  'icon-a-37': IconA37,
  'icon-a-38': IconA38,
  'icon-a-39': IconA39,
  'icon-a-40': IconA40,
  'icon-a-41': IconA41,
  'icon-a-42': IconA42,
  'icon-a-43': IconA43,
  'icon-a-44': IconA44,
  'icon-a-45': IconA45,
  'icon-a-46': IconA46,
  'icon-a-47': IconA47,
  'icon-a-48': IconA48,
  'icon-a-49': IconA49,
  'icon-a-50': IconA50,
  'icon-a-51': IconA51,
  'icon-a-52': IconA52,
  'icon-a-53': IconA53,
  'icon-a-54': IconA54,
  'icon-a-55': IconA55,
  'icon-a-56': IconA56,
  'icon-a-57': IconA57,
  'icon-a-58': IconA58,
  'icon-a-59': IconA59,
  'icon-a-60': IconA60,
  'icon-a-61': IconA61,
  'icon-a-62': IconA62,
  'icon-a-63': IconA63,
  'icon-a-64': IconA64,
  'icon-a-65': IconA65,
  'icon-a-66': IconA66,
  'icon-a-67': IconA67,
  'icon-a-68': IconA68,
  'icon-a-70': IconA70,
  'icon-chehui': require('../static/icons/icon-chehui.png'),
  'icon-biaoqing': require('../static/icons/icon-biaoqing.png'),
  'icon-cancel-mute': require('../static/icons/icon-cancel-mute.png'),
  'icon-cancel-top': require('../static/icons/icon-cancel-top.png'),
  'icon-chat-history': require('../static/icons/icon-chat-history.png'),
  'icon-chuangjianqunzu': require('../static/icons/icon-chuangjianqunzu.png'),
  'icon-delete': require('../static/icons/icon-delete.png'),
  'icon-down-arrow': require('../static/icons/icon-down-arrow.png'),
  'icon-down-arrow-white': require('../static/icons/icon-down-arrow-white.png'),
  'icon-duoxuan': require('../static/icons/icon-duoxuan.png'),
  'icon-error': require('../static/icons/icon-error.png'),
  'icon-friend': require('../static/icons/icon-friend.png'),
  'icon-fuzhi1': require('../static/icons/icon-fuzhi1.png'),
  'icon-guanbi': require('../static/icons/icon-guanbi.png'),
  'icon-guanyu': require('../static/icons/icon-guanyu.png'),
  'icon-huifu': require('../static/icons/icon-huifu.png'),
  'icon-jiantou': require('../static/icons/icon-jiantou.png'),
  'icon-join': require('../static/icons/icon-join.png'),
  'icon-lahei2': require('../static/icons/icon-lahei2.png'),
  'icon-more-white': require('../static/icons/icon-more-white.png'),
  'icon-mute': require('../static/icons/icon-mute.png'),
  'icon-quxiaozhiding': require('../static/icons/icon-quxiaozhiding.png'),
  'icon-read': require('../static/icons/icon-read.png'),
  'icon-send-default': require('../static/icons/sending.png'),
  'icon-send-selected': require('../static/icons/icon-send-selected.png'),
  'icon-shanchu': require('../static/icons/icon-shanchu.png'),
  'icon-shezhi1': require('../static/icons/icon-shezhi1.png'),
  'icon-shipin': require('../static/icons/icon-shipin.png'),
  'icon-sousuo': require('../static/icons/icon-sousuo.png'),
  'icon-tianjiaanniu': require('../static/icons/icon-tianjiaanniu.png'),
  'icon-team2': require('../static/icons/icon-team2.png'),
  'icon-tianjiahaoyou': require('../static/icons/icon-tianjiahaoyou.png'),
  'icon-top': require('../static/icons/icon-top.png'),
  'icon-tuigejian': require('../static/icons/icon-tuigejian.png'),
  'icon-tupian': require('../static/icons/icon-tupian.png'),
  'icon-weizhiwenjian': require('../static/icons/icon-weizhiwenjian.png'),
  'icon-wenjian': require('../static/icons/icon-wenjian.png'),
  'icon-warning': require('../static/icons/icon-warning.png'),
  'icon-xiaoximiandarao': require('../static/icons/icon-xiaoximiandarao.png'),
  'icon-xiaoxizhiding': require('../static/icons/icon-xiaoxizhiding.png'),
  'icon-yanzheng': require('../static/icons/icon-yanzheng.png'),
  'icon-yidu': require('../static/icons/icon-yidu.png'),
  'icon-success': require('../static/icons/icon-success.png'),
  'icon-yuyin1': require('../static/icons/icon-yuyin1.png'),
  'icon-collection': require('../static/icons/add-collection.png'),
  'icon-paishe': require('../static/paishe.png'),
  'icon-zhuanfa': require('../static/icons/icon-zhuanfa.png')
} as const

export type NEUIKitIconName = keyof typeof iconSources

export function UIKitIcon({
  type,
  size = 16,
  width,
  height,
  tintColor,
  style
}: {
  type: NEUIKitIconName
  size?: number
  width?: number
  height?: number
  tintColor?: string
  style?: StyleProp<ImageStyle>
}) {
  return (
    <Image
      source={iconSources[type]}
      style={[{ width: width || size, height: height || size, tintColor }, style]}
      contentFit="contain"
    />
  )
}
