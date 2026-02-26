---
name: <skill-name>
description: <Generate visual outputs from source content through multi-step analysis, option confirmation, prompt assembly, and image generation>. Use when user asks to "<trigger-1>", "<trigger-2>", or "<trigger-3>".
---

# <Skill Title>

One-line objective: transform source content into a structured visual output set.

## Usage

```bash
/<skill-name> path/to/content.md
/<skill-name> path/to/content.md --style <style>
/<skill-name> --quick
# paste content
```

## Options

| Option | Description |
|--------|-------------|
| `--style <name>` | Visual style preset or custom style |
| `--layout <name>` | Layout strategy |
| `--lang <code>` | Output language |
| `--quick` | Skip optional confirmation rounds |
| `--ref <files...>` | Reference images |

## File Structure

```text
<output-root>/<topic-slug>/
├── source.md
├── analysis.md
├── outline.md
├── prompts/
│   └── 01-*.md
├── refs/                  # optional
└── outputs/
    └── 01-*.png
```

## Workflow

### Progress Checklist

```text
Progress:
- [ ] Step 0: Load preferences (optional BLOCKING)
- [ ] Step 1: Analyze input and save artifacts
- [ ] Step 2: Confirm key options (unless --quick)
- [ ] Step 3: Build outline / prompt files
- [ ] Step 4: Generate visual outputs
- [ ] Step 5: Final report
```

### Step 0: Load Preferences (EXTEND.md) [Optional BLOCKING]

Use Bash to check EXTEND.md (priority order):

```bash
test -f .baoyu-skills/<skill-name>/EXTEND.md && echo "project"
test -f "$HOME/.baoyu-skills/<skill-name>/EXTEND.md" && echo "user"
```

If not found:
- either continue with defaults
- or run first-time setup (if your skill requires persisted preferences)

### Step 1: Analyze Input

1. Save source content to `source.md` when user pasted plain text.
2. Extract topic, audience, tone, language, key entities, and data points.
3. Save analysis to `analysis.md`.
4. Determine output slug and target output directory.

### Step 2: Confirm Options

Use `AskUserQuestion` when:
- user did not explicitly provide style/layout/count
- multiple equally valid options exist

Collect and persist:
- style
- layout
- language
- expected output count

### Step 3: Build Outline and Prompts

1. Generate `outline.md` from analysis.
2. Generate one prompt file per output under `prompts/`.
3. If references exist, store files under `refs/` and map each prompt to references.

### Step 4: Generate Outputs

1. Select an available generation backend skill.
2. Generate outputs sequentially by default.
3. If user explicitly requests concurrency, generate in parallel with bounded concurrency.
4. Retry each failed generation once before surfacing error.

### Step 5: Final Report

Report:
- chosen style/layout/language
- generated count (success/failure)
- output directory
- key files created

## Modification

For regeneration:
1. update prompt file first
2. regenerate target output(s)
3. keep old files with backup suffix when overwriting

## Extension Support

Custom config via EXTEND.md. Keep schema in:

`references/config/preferences-schema.md`

## References

- `references/analysis-framework.md`
- `references/outline-template.md`
- `references/base-prompt.md`

