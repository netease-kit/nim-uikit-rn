## 1. Spec Alignment

- [x] 1.1 记录 Android 相机“仅本次允许”回收后的重新请求行为

## 2. Implementation

- [x] 2.1 调整相机权限链路，兼容一次性授权回收后的再次请求
- [x] 2.2 保持首次拒绝后不立即弹出“去设置”提示
- [x] 2.3 增加 Android 原生 kill 后撤销相机权限兼容模块

## 3. Validation

- [x] 3.1 校验 OpenSpec 变更
- [x] 3.2 运行类型检查和针对权限链路的静态校验
