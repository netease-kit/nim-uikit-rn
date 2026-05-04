# im-feature-foundation-portable

这是 `im-feature-foundation` 的可迁移打包目录。

用途：
- 把当前仓库中的母 Skill 导出到别的仓库
- 给别的项目一个独立可复制的 skill 包入口
- 作为分发前的整理层，而不是直接修改源 skill 目录

## 包含内容

- `manifest.json`
- `INSTALL.md`
- 导出脚本使用说明

真正的 skill 内容来自：
- `skills/im-feature-foundation/`

## 推荐用法

1. 运行导出脚本
2. 把生成的 `im-feature-foundation/` 目录复制到目标仓库的 skill 目录
3. 在目标仓库中根据技术栈继续补适配层或项目特定约束

## 导出命令

```bash
./scripts/export-im-feature-foundation.sh /tmp/im-feature-foundation-export
```

导出后会得到：

```text
/tmp/im-feature-foundation-export/
  im-feature-foundation/
    SKILL.md
    README.md
    evals/
    references/
```
