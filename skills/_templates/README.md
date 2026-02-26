# Skills 分类提取与模板索引

本目录用于把 `skills/` 里的现有技能按类型抽象成可复用模板，方便新建同类技能时直接套用。

## 当前技能总览（基于 `skills/*/SKILL.md`）

- 总技能数：15
- 高频章节：`Usage`、`Script Directory`、`Options`、`Preferences (EXTEND.md)`、`Workflow`、`Extension Support`
- 资源形态：
  - 参考文档密集型（`references/` 多、流程编排重）
  - 脚本密集型（`scripts/` 多、CLI 执行重）
  - 平台发布型（认证/发布流程重）
  - 高风险逆向型（显式 consent + 免责声明）

## 分类结果（主分类）

### 1) 视觉生成编排型（Visual Orchestrator）

特点：多步骤工作流、强交互确认、引用大量 `references/`，常调用图像生成技能作为后端。

包含：
- `baoyu-article-illustrator`
- `baoyu-comic`
- `baoyu-cover-image`
- `baoyu-infographic`
- `baoyu-slide-deck`
- `baoyu-xhs-images`

模板：`template-visual-orchestrator.SKILL.md`

### 2) 生成引擎型（Generation Engine）

特点：统一封装多 provider/模型，偏 CLI 参数与路由策略，供其他技能复用。

包含：
- `baoyu-image-gen`

模板：`template-generation-engine.SKILL.md`

### 3) 转换与处理工具型（CLI Transformer）

特点：单一明确输入输出，脚本执行为核心，规则可复现。

包含：
- `baoyu-compress-image`
- `baoyu-format-markdown`
- `baoyu-markdown-to-html`
- `baoyu-url-to-markdown`

模板：`template-cli-transformer.SKILL.md`

### 4) 平台发布自动化型（Platform Publisher）

特点：平台凭证、预检、元数据校验、发布动作与回执。

包含：
- `baoyu-post-to-wechat`
- `baoyu-post-to-x`

模板：`template-platform-publisher.SKILL.md`

### 5) 高风险逆向接口型（Danger Reverse API）

特点：反向工程接口、必须先授权 consent、风险提示不可省略。

包含：
- `baoyu-danger-gemini-web`
- `baoyu-danger-x-to-markdown`

模板：`template-danger-reverse-api.SKILL.md`

## 分类结果（辅助维度：按脚本依赖）

这个维度适合用于决定模板复杂度和维护策略。

### A) 无脚本（纯编排/纯说明）

判定：`scripts/` 不存在或无可执行文件。

包含：
- `baoyu-article-illustrator`
- `baoyu-cover-image`
- `baoyu-infographic`
- `baoyu-xhs-images`

建议：
- 重点优化 `Workflow`、`References`、确认流程
- 避免在 SKILL.md 内堆叠实现细节

### B) 轻脚本（1-2 个脚本）

判定：`scripts/` 文件数在 1-2。

包含：
- `baoyu-comic`（1）
- `baoyu-compress-image`（1）
- `baoyu-slide-deck`（2）

建议：
- 保持单入口脚本约定（`scripts/main.ts` 或明确脚本表）
- 在 `Usage` 中给出最小可运行命令

### C) 重脚本（>=5 个脚本）

判定：`scripts/` 文件数大于等于 5。

包含：
- `baoyu-danger-gemini-web`（24）
- `baoyu-danger-x-to-markdown`（14）
- `baoyu-format-markdown`（6）
- `baoyu-image-gen`（6）
- `baoyu-markdown-to-html`（20）
- `baoyu-post-to-wechat`（26）
- `baoyu-post-to-x`（11）
- `baoyu-url-to-markdown`（5）

建议：
- 必须明确：认证、参数优先级、错误处理、输出契约
- 优先把长说明下沉到 `references/`，SKILL.md 保持流程骨架
- 逆向或高风险能力必须内置 `consent` 和免责声明

## 如何选择模板

按下面顺序判定：

1. 只要涉及反向工程/高风险接口，优先使用 `template-danger-reverse-api.SKILL.md`。
2. 只要目标是“发到平台”，使用 `template-platform-publisher.SKILL.md`。
3. 若核心是“多阶段内容生成编排”，使用 `template-visual-orchestrator.SKILL.md`。
4. 若核心是“多 provider 能力封装”，使用 `template-generation-engine.SKILL.md`。
5. 其余输入->输出的脚本化处理，使用 `template-cli-transformer.SKILL.md`。

## 编写规范（和现有仓库保持一致）

- Frontmatter 仅保留：
  - `name`
  - `description`
- `description` 必须包含：
  - 技能做什么
  - 触发词/触发场景（Use when ...）
- 章节建议顺序：
  - `Usage` -> `Script Directory` -> `Options` -> `Workflow`（如需要）-> `Extension Support`
- 任何 `BLOCKING` 步骤必须显式标注且在流程前置。
- 涉及偏好配置时，统一给出 `EXTEND.md` 检测顺序：
  - `.baoyu-skills/<skill>/EXTEND.md`
  - `$HOME/.baoyu-skills/<skill>/EXTEND.md`
