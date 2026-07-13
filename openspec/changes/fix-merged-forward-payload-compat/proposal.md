# Change: 修复合并转发消息体跨端兼容性

## Why

当前 RN Demo 发送的合并转发消息使用本地自定义的 `subType=100001 + raw payload` 结构，React Web、Android 等参考端识别的是统一的 `type=101` 合并转发协议以及可下载的序列化聊天记录文件。因此其他端收到 RN 发出的合并转发消息后会显示为“未知消息体”。

## What Changes

- 将 RN 合并转发发送结构改为与 Web、Android、iOS 对齐的 `type=101` 自定义消息协议。
- 发送合并转发时上传序列化消息记录文件，并在消息体中写入 `sessionId`、`sessionName`、`url`、`md5`、`depth`、`abstracts`。
- 保留对历史 RN 私有 `subType=100001` 合并转发消息的兼容解析。
- 为 RN 详情页补充标准 `type=101` 协议的下载与反序列化展示链路。

## Impact

- 影响聊天页、转发页、会话列表预览、收藏/历史/标记消息中的合并转发识别与打开行为。
- 不改变逐条转发与普通单条转发协议。
