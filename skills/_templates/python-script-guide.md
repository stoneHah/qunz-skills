# Python 脚本执行指南

当 skill 使用 Python（而非 TypeScript）编写脚本时，参考本指南适配各模板中的 Script Directory 和执行命令。

## 与 TypeScript 的核心差异

| 维度 | TypeScript | Python |
|------|-----------|--------|
| 运行时 | `npx -y bun` | `uv run` |
| 依赖声明 | 无（自包含） | `pyproject.toml` |
| 工作目录要求 | 无（绝对路径即可） | 必须在 `pyproject.toml` 所在目录 |
| 执行命令 | `npx -y bun ${SKILL_DIR}/scripts/main.ts` | `cd "${SKILL_DIR}" && uv run scripts/main.py` |

## Script Directory 模板（Python 版）

替换各模板中的 Script Directory 部分：

```markdown
## Script Directory

Scripts in `scripts/` directory. Replace `${SKILL_DIR}` with this SKILL.md directory path.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.py`
3. All commands MUST run from `${SKILL_DIR}` (where `pyproject.toml` lives)

| Script | Purpose |
|--------|---------|
| `scripts/main.py` | Main entry point |
```

## 执行命令模板

### 标准执行

```bash
cd "${SKILL_DIR}" && uv run scripts/main.py [options]
```

### 带依赖同步（首次或依赖变更后）

```bash
cd "${SKILL_DIR}" && uv sync && uv run scripts/main.py [options]
```

### 多脚本场景

```bash
cd "${SKILL_DIR}" && uv run scripts/transform.py <input>
cd "${SKILL_DIR}" && uv run scripts/validate.py <output>
```

## 为什么必须 `cd`

`uv run` 依赖当前目录下的 `pyproject.toml` 来：
- 确定依赖列表
- 定位或创建虚拟环境（`.venv/`）
- 解析 inline script metadata（如有）

直接用绝对路径 `uv run ${SKILL_DIR}/scripts/main.py` **可能找不到 `pyproject.toml`**，导致依赖缺失。

## 目录结构要求

```text
skills/qunz-<name>/
├── SKILL.md
├── pyproject.toml          # 必需：声明依赖
├── scripts/
│   └── main.py
├── prompts/                # 可选
└── references/             # 可选
```

### pyproject.toml 最小模板

```toml
[project]
name = "qunz-<name>"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    # 按需添加
]
```

## 各模板适配示例

### CLI Transformer 模板

```markdown
### Step 3: Execute Transform

\`\`\`bash
cd "${SKILL_DIR}" && uv run scripts/main.py <input> [options]
\`\`\`
```

### Generation Engine 模板

```markdown
## Usage

\`\`\`bash
cd "${SKILL_DIR}" && uv run scripts/main.py --prompt "..." --output out.png
cd "${SKILL_DIR}" && uv run scripts/main.py --promptfiles a.md b.md --output out.png
\`\`\`
```

### Danger Reverse API 模板

```markdown
## Usage

\`\`\`bash
cd "${SKILL_DIR}" && uv run scripts/main.py <input>
cd "${SKILL_DIR}" && uv run scripts/main.py --login
\`\`\`
```

### Platform Publisher 模板

```markdown
## Pre-flight Check

\`\`\`bash
cd "${SKILL_DIR}" && uv run scripts/check-permissions.py
\`\`\`
```

## 注意事项

- **不要** 使用 `pip install` 或手动激活虚拟环境
- **不要** 使用 `python scripts/main.py`（可能缺少依赖）
- `uv` 会自动管理 `.venv/`，将其加入 `.gitignore`
- 如需环境变量，在 `cd` 之后、`uv run` 之前设置，或通过 `.env` 文件加载
