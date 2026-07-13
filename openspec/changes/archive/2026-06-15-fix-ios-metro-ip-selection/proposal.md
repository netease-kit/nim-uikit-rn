## Why

当前 iOS Debug 真机安装后会卡在 “Loading from Metro...”。排查发现应用包中的 `ip.txt` 被写成过期的局域网地址 `192.168.0.105`，而当前 Mac 实际可达的 Metro 地址是 `10.242.137.8:8081`。真机按过期地址拼装 JS bundle URL，导致一直无法从 Metro 拉取 JavaScript。

## What Changes

- 调整 iOS Debug 构建生成 `ip.txt` 的逻辑，优先选择当前默认路由对应的本机局域网 IP，而不是按 `en0..en8` 顺序取第一个地址。
- 保持现有 `AppDelegate.swift` 基于 `ip.txt` 拼装 `8081` Metro URL 的启动路径不变。
- 继续兼容无法解析默认路由网卡时的兜底 IP 发现逻辑。

## Impact

- 受影响代码：`ios/im2rndemo.xcodeproj/project.pbxproj`
- 受影响行为：iOS Debug 真机通过 `8081` 连接本机 Metro 的启动行为
- 无新增依赖，无运行时协议变更
