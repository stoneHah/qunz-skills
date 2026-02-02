---
name: baoyu-{skill-name}
description: {一句话功能描述，包含触发关键词}. Use when user asks to "{trigger-keyword1}", "{trigger-keyword2}", or "{trigger-keyword3}".
---

# {Skill Display Name}

{Brief description of what this skill does}.

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | CLI entry point |
| `scripts/other.ts` | Other functionality |

## Usage

```bash
# Basic usage
npx -y bun ${SKILL_DIR}/scripts/main.ts {required-args}

# With options
npx -y bun ${SKILL_DIR}/scripts/main.ts {required-args} --option value

# Common patterns
npx -y bun ${SKILL_DIR}/scripts/main.ts --help
```

## Options

| Option | Description |
|--------|-------------|
| `--style <name>` | Style name (see Style Gallery) |
| `--layout <name>` | Layout name (see Layout Gallery) |
| `--lang <code>` | Output language (en, zh, ja, etc.) |

## Style Gallery (If Applicable)

| Style | Description |
|-------|-------------|
| `default` | Default style description |
| `style1` | Description of style1 |
| `style2` | Description of style2 |

Detailed style definitions: `references/styles/<style>.md`

## Layout Gallery (If Applicable)

| Layout | Description |
|--------|-------------|
| `default` | Default layout description |
| `layout1` | Description of layout1 |
| `layout2` | Description of layout2 |

Detailed layout definitions: `references/layouts/<layout>.md`

## Auto Selection (If Applicable)

When no options are specified, the system analyzes content to make recommendations:

| Content Signals | Recommended Option |
|----------------|-------------------|
| keyword1, keyword2 | `option1` |
| keyword3, keyword4 | `option2` |

## File Structure

Each session creates an independent directory named by content slug:

```
{skill-name}/{topic-slug}/
├── source-{slug}.{ext}    # Source files
├── analysis.md            # Analysis results
├── outline.md             # Content outline
├── prompts/               # Generation prompts
│   └── 01-{type}-{slug}.md
└── output-files           # Generated outputs
```

**Slug Generation**:
1. Extract main topic from content (2-4 words, kebab-case)
2. Example: "Topic Name Here" → `topic-name-here`

**Conflict Resolution**:
If `{skill-name}/{topic-slug}/` already exists:
- Append timestamp: `{topic-slug}-YYYYMMDD-HHMMSS`

**Source Files**:
Copy all sources with naming `source-{slug}.{ext}`:
- `source-article.md`, `source-image.png`, etc.

## Workflow

### Step 1: Analyze Content

1. Save source content (if not already a file)
2. Extract key information: topic, core message, tone
3. Detect source language and user language

### Step 2: Determine Options

1. Analyze content signals for style/layout recommendations
2. Prepare 2-3 options for user confirmation

### Step 3: Confirm Options

**IMPORTANT**: Present ALL options in a single confirmation step using AskUserQuestion.

**Questions to ask**:
- Style/Layout selection (always)
- Language (if source ≠ user language)
- Other relevant options

**Format**:
- Option A (Recommended): [option] - [brief rationale]
- Option B: [option] - [brief rationale]
- Option C: [option] - [brief rationale]

### Step 4: Generate Content

With confirmed options:
1. Create prompt file(s) in `prompts/` directory
2. Call selected generation skill with prompt
3. Report progress after each generation

### Step 5: Output Summary

```
Generation Complete!

Topic: [topic]
Options: [confirmed options]
Location: [directory path]
Files: [list of generated files]
```

## Modification Support (If Applicable)

### Edit Single Item

1. Update prompt file if needed
2. Regenerate with same parameters
3. Report completion

### Add New Item

1. Create new prompt file
2. Generate new item
3. Renumber subsequent files if needed
4. Update outline.md

### Delete Item

1. Remove files
2. Renumber if needed
3. Update outline.md

## Notes

- Typical generation time: 10-30 seconds per item
- Auto-retry once on generation failure
- Maintain style consistency across all outputs
- All text uses user's confirmed language preference

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.baoyu-skills/{skill-name}/EXTEND.md` (project)
2. `~/.baoyu-skills/{skill-name}/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
