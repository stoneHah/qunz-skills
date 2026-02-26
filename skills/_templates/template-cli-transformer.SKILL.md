---
name: <skill-name>
description: <Transforms input A into output B through deterministic CLI processing>. Use when user asks to "<trigger-1>", "<trigger-2>", or "<trigger-3>".
---

# <Skill Title>

Single-responsibility converter/formatter with stable input-output behavior.

## Script Directory

Scripts in `scripts/` directory. Replace `${SKILL_DIR}` with this SKILL.md directory path.

| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main transform command |

## Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
test -f .baoyu-skills/<skill-name>/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/<skill-name>/EXTEND.md" && echo "user"
```

If found: load and apply.
If not found: use defaults.

## Workflow

### Step 1: Validate Input

1. verify file/path exists or normalize raw input
2. validate extension and supported format

### Step 2: Resolve Effective Configuration

priority:
1. CLI args
2. EXTEND.md
3. defaults

### Step 3: Execute Transform

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts <input> [options]
```

### Step 4: Save and Report

Report:
- output path
- backup path (if overwrite)
- key transform summary (e.g. size reduction, formatted blocks)

## Usage

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts <input>
npx -y bun ${SKILL_DIR}/scripts/main.ts <input> --output out.ext
npx -y bun ${SKILL_DIR}/scripts/main.ts <input> --json
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `<input>` | input file or directory | required |
| `--output`, `-o` | output path | auto-derived |
| `--format`, `-f` | output format | skill default |
| `--quality`, `-q` | quality level | skill default |
| `--recursive`, `-r` | process recursively | false |
| `--json` | JSON output | false |

## Output

Describe output location, naming convention, and conflict handling strategy.

## Extension Support

List supported EXTEND keys and defaults.

