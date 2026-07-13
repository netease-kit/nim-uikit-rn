# Install Guide

## 目标

把 `im-feature-foundation` 安装到另一个仓库，让那个仓库也能直接使用这套 IM 母 Skill。

## 方法一：先导出再复制

在当前仓库执行：

```bash
./scripts/export-im-feature-foundation.sh /tmp/im-feature-foundation-export
```

然后把下面这个目录复制到目标仓库的 skills 目录：

```text
/tmp/im-feature-foundation-export/im-feature-foundation
```

## 方法二：直接复制源 skill

如果你不需要中间导出层，也可以直接复制：

```text
skills/im-feature-foundation/
```

## 建议安装位置

常见放置方式：

- `<target-repo>/skills/im-feature-foundation/`
- `<target-repo>/.codex/skills/im-feature-foundation/`

具体以目标环境的 skill 加载约定为准。

## 迁移后建议检查

至少检查：

- `SKILL.md` 是否存在
- `references/` 是否完整
- `evals/evals.json` 是否存在
- 目标仓库是否需要补项目适配 skill

## 推荐搭配

如果目标仓库是全新项目：

- 先安装 `im-feature-foundation`

如果目标仓库已经有现成 IM 代码边界：

- 安装 `im-feature-foundation`
- 再增加一个项目专用 adapter skill
