---
name: <skill-name>
description: <Unified generation backend across multiple providers/models with routing, quality/aspect controls, and optional references>. Use when user asks to "<trigger-1>", "<trigger-2>", or when other skills need "<backend capability>".
---

# <Skill Title>

Provider-agnostic generation engine with deterministic CLI contract.

## Script Directory

Agent execution:
1. `SKILL_DIR` = this SKILL.md directory
2. script path = `${SKILL_DIR}/scripts/main.ts`

## Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
test -f .baoyu-skills/<skill-name>/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/<skill-name>/EXTEND.md" && echo "user"
```

If found: read and apply.
If not found: use defaults.

## Usage

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "..." --output out.png
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "..." --provider <provider> --model <model> --output out.png
npx -y bun ${SKILL_DIR}/scripts/main.ts --promptfiles a.md b.md --ref ref.png --output out.png
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt <text>` | Prompt text |
| `--promptfiles <files...>` | Prompt fragments |
| `--output <path>` | Output path |
| `--provider <name>` | Provider selection |
| `--model <id>` | Model ID |
| `--quality <level>` | Quality preset |
| `--ar <ratio>` | Aspect ratio |
| `--ref <files...>` | Reference images/files |
| `--n <count>` | Number of outputs |
| `--json` | JSON output |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `<PROVIDER_A>_API_KEY` | Provider A credential |
| `<PROVIDER_B>_API_KEY` | Provider B credential |
| `<PROVIDER_A>_MODEL` | Provider A model override |
| `<PROVIDER_B>_MODEL` | Provider B model override |
| `<PROVIDER_A>_BASE_URL` | Provider A endpoint override |

Load priority:
`CLI args > EXTEND.md > env vars > <cwd>/.baoyu-skills/.env > ~/.baoyu-skills/.env`

## Provider Selection

1. explicit `--provider` wins
2. if references provided, choose providers that support reference input
3. if only one credential exists, use that provider
4. otherwise use default provider from EXTEND.md or built-in default

## Quality and Aspect Presets

Define a small fixed preset table to keep behavior predictable.

## Generation Mode

- Default: sequential generation
- Optional: parallel generation only when explicitly requested

## Error Handling

- missing key -> actionable setup message
- invalid model/provider combo -> fix hint
- transient generation failure -> one retry

## Extension Support

Document supported EXTEND keys and their defaults. Keep schema in:

`references/config/preferences-schema.md`

