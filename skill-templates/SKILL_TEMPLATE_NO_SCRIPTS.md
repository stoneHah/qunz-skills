---
name: baoyu-{skill-name}
description: {一句话功能描述，强调触发方式}. Use when user asks to "{trigger-keyword1}", "{trigger-keyword2}", or "{trigger-keyword3}".
---

# {Skill Display Name}

{Brief description of what this skill does}.

## Usage

```bash
# From file path
/baoyu-{skill-name} path/to/content.md

# With options
/baoyu-{skill-name} path/to/content.md --style option1

# Direct content input
/baoyu-{skill-name}
[paste content]

# Direct input with options
/baoyu-{skill-name} --style option
[paste content]
```

## Options

| Option | Description |
|--------|-------------|
| `--style <name>` | Visual style (see Style Gallery) |
| `--layout <name>` | Information layout (see Layout Gallery) |
| `--lang <code>` | Output language (en, zh, ja, etc.) |
| `--other-option` | Other option description |

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

When no options are specified, the system analyzes content to select the best options:

| Content Signals | Selected Style | Selected Layout |
|----------------|----------------|-----------------|
| keyword1, keyword2 | `style1` | `layout1` |
| keyword3, keyword4 | `style2` | `layout2` |

## File Structure

Each session creates an independent directory named by content slug:

```
{skill-name}/{topic-slug}/
├── source-{slug}.{ext}         # Source files (text, images, etc.)
├── analysis.md                 # Deep analysis results
├── {output-file}               # Generated output
└── prompts/                    # Generation prompts (if applicable)
    └── {prompt-files}.md
```

**Slug Generation**:
1. Extract main topic from content (2-4 words, kebab-case)
2. Example: "Topic Name Here" → `topic-name-here`

**Conflict Resolution**:
If `{skill-name}/{topic-slug}/` already exists:
- Append timestamp: `{topic-slug}-YYYYMMDD-HHMMSS`

**Source Files**:
Copy all sources with naming `source-{slug}.{ext}`:
- `source-article.md` (main text content)
- `source-image.png` (image from conversation)
- Multiple sources supported: text, images, files from conversation

## Workflow

### Step 1: Analyze Content

**Actions**:
1. Save source content (if not already a file):
   - If user provides a file path: use as-is
   - If user pastes content: save to `source.md` in target directory

2. Read and analyze source content:
   - **Main topic**: What is this content about?
   - **Core message**: Key takeaways
   - **Tone/mood**: Serious, playful, educational, etc.
   - **Content structure**: How information is organized

3. Detect languages:
   - Identify **source language** from content
   - Identify **user language** from conversation
   - Note if source_language ≠ user_language (will ask in Step 3)

4. Generate recommendations:
   - Style recommendations based on content signals
   - Layout recommendations based on structure
   - Save analysis to `analysis.md`

### Step 2: Determine Options

Based on analysis:
1. **Style selection**:
   - If `--style` specified, use that style
   - Otherwise, prepare 2-3 style options with rationale

2. **Layout selection** (if applicable):
   - If `--layout` specified, use that layout
   - Otherwise, prepare 2-3 layout options

3. **Other options**:
   - Prepare aspect ratio, language, or other relevant options

### Step 3: Confirm Options

**IMPORTANT**: Present ALL options in a single confirmation step using AskUserQuestion.

**Determine which questions to ask**:

| Question | When to Ask |
|----------|-------------|
| Style | Always (required) |
| Layout | Always (if applicable) |
| Language | Only if `source_language ≠ user_language` |
| Other options | Only if relevant |

**Language handling**:
- If source language = user language: Just inform user (e.g., "Output will be in Chinese")
- If different: Ask which language to use

**AskUserQuestion format** (example with all questions):

```
Question 1 (Style): Which style?
- A: style1 (Recommended) - Brief rationale
- B: style2 - Brief rationale
- C: style3 - Brief rationale

Question 2 (Layout): Which layout?
- Keep recommended (layout1)
- Option: layout2
- Option: layout3

Question 3 (Language) - only if mismatch:
- Chinese (matches content)
- English (your preference)
```

**After confirmation**:
1. Record confirmed options
2. User may request modifications before generation

### Step 4: Generate Content

**Image Generation Skill Selection** (if applicable):
1. Check available image generation skills
2. Read selected skill's SKILL.md for parameter reference
3. If multiple skills available, ask user preference

**Generation Process**:
1. Create detailed prompt(s) in `prompts/` directory
2. Call selected generation skill with:
   - Prompt file path
   - Output path
   - Any skill-specific parameters
3. Report progress after each generation
4. Auto-retry once on failure

**Session Management** (if applicable):
If image generation skill supports `--sessionId`:
1. Generate unique session ID: `{skill}-{topic}-{timestamp}`
2. Use same session ID for all generations
3. Ensures visual consistency across outputs

### Step 5: Output Summary

```
Generation Complete!

Topic: [topic]
Style: [style name]
Layout: [layout name]
Language: [confirmed language]
Location: [directory path]

Files Generated:
✓ analysis.md
✓ {output-file}
✓ prompts/{prompt-files}.md (if applicable)

Preview the output to verify it matches your expectations.
```

## Modification Support

After generation, user may request modifications:

### Edit Output

1. Identify what to modify
2. Update source or prompt files if needed
3. Regenerate with updated parameters
4. Report completion

### Add/Remove Content

1. Analyze the impact of changes
2. Update relevant files (outline, prompts)
3. Regenerate affected portions
4. Report updated status

## Notes

- Generation time varies by complexity
- Maintain style consistency across all outputs
- All text uses user's confirmed language preference
- Original source files remain unchanged
- Multiple source files supported

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.baoyu-skills/{skill-name}/EXTEND.md` (project)
2. `~/.baoyu-skills/{skill-name}/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
