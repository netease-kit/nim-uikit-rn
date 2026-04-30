# IM SDK Abstraction

用于定义新项目中的 SDK / 接口适配层。

## 原则

- 不要让页面直接调用 IM SDK
- 不要让所有 store 都各自散落一套 SDK 调用
- 先定义统一能力，再接具体 SDK

## 推荐抽象

### AuthService
- login
- logout
- restoreSession
- requestSmsCode

### SessionService
- listSessions
- createSession
- deleteSession
- clearUnread
- toggleStickTop
- toggleMute

### MessageService
- listHistory
- sendText
- sendImage
- sendFile
- revoke
- forward
- pin

### FriendService
- listFriends
- listApplications
- addFriend
- acceptApplication
- rejectApplication
- updateRemark
- blockUser

### TeamService
- listTeams
- getTeamInfo
- createTeam
- inviteMembers
- updateTeamInfo
- leaveTeam
- dismissTeam

## 输出要求

当用户问“某功能如何从零实现”时，需要说明：
- 业务层需要哪些 service 能力
- 页面和 store 如何调用这些能力
- SDK 错误如何映射为用户可见状态
