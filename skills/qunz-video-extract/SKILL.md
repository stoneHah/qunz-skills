---
name: qunz-video-extract
description: Extracts and downloads videos from Douyin and Kuaishou short URLs using Playwright browser automation. Use when user shares "v.douyin.com" or "v.kuaishou.com" links, or asks to "download video", "extract video", "save short video", "提取视频", "下载短视频".
---

# Video Extractor

Downloads videos from Douyin (抖音) and Kuaishou (快手) short URLs using headless browser automation.

## Script Directory

Scripts located in `scripts/` subdirectory.

**Path Resolution**:
1. `SKILL_DIR` = this SKILL.md's directory
2. Script path = `${SKILL_DIR}/scripts/main.ts`

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |
| `scripts/extractor.ts` | Playwright-based video URL extraction |
| `scripts/downloader.ts` | Video file download |
| `scripts/paths.ts` | Path utilities |

## Prerequisites

Playwright must be installed before first use:

```bash
cd ${SKILL_DIR}/scripts && bun install && bunx playwright install chromium
```

## Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
# Check project-level first
test -f .baoyu-skills/qunz-video-extract/EXTEND.md && echo "project"

# Then user-level (cross-platform: $HOME works on macOS/Linux/WSL)
test -f "$HOME/.baoyu-skills/qunz-video-extract/EXTEND.md" && echo "user"
```

┌──────────────────────────────────────────────────────┬───────────────────┐
│                         Path                         │     Location      │
├──────────────────────────────────────────────────────┼───────────────────┤
│ .baoyu-skills/qunz-video-extract/EXTEND.md           │ Project directory │
├──────────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.baoyu-skills/qunz-video-extract/EXTEND.md     │ User home         │
└──────────────────────────────────────────────────────┴───────────────────┘

┌───────────┬───────────────────────────────────────────────────────────────────────────┐
│  Result   │                                  Action                                   │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, apply settings                                               │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Not found │ Ask user with AskUserQuestion (see references/config/first-time-setup.md) │
└───────────┴───────────────────────────────────────────────────────────────────────────┘

**EXTEND.md Supports**: Default output directory

### Supported Keys

| Key | Default | Values | Description |
|-----|---------|--------|-------------|
| `default_output_dir` | empty | path or empty | Default output directory (empty = `./video-extract/`) |

**Value priority**:
1. CLI arguments (`-o`)
2. EXTEND.md
3. Skill defaults

Schema: [references/config/preferences-schema.md](references/config/preferences-schema.md)

## Supported URLs

| Pattern | Platform |
|---------|----------|
| `https://v.douyin.com/xxxxxxx/` | Douyin (抖音) |
| `https://v.kuaishou.com/xxxxxxx` | Kuaishou (快手) |
| Text containing above URLs | Auto-extracted |

## Usage

```bash
npx -y bun ${SKILL_DIR}/scripts/main.ts <url-or-text>
npx -y bun ${SKILL_DIR}/scripts/main.ts <url> -o ./output/
npx -y bun ${SKILL_DIR}/scripts/main.ts <url> --info
npx -y bun ${SKILL_DIR}/scripts/main.ts <url> --json
```

## Options

| Option | Description |
|--------|-------------|
| `<url-or-text>` | Short URL or text containing a short URL |
| `-o <path>` | Output directory or file path |
| `--json` | JSON output with full metadata |
| `--info` | Show video info only, do not download |
| `--help`, `-h` | Show help |

## Output

**File structure**: `video-extract/<slug>/video-<slug>.mp4`

**Text output** (default): prints the file path to stdout.

**JSON output** (`--json`):
```json
{
  "platform": "douyin",
  "videoId": "7123456789",
  "title": "Video title",
  "author": "Author name",
  "videoUrl": "https://...",
  "filePath": "video-extract/xxx/video-xxx.mp4",
  "fileSize": 12345678,
  "durationMs": 3500
}
```

**Info output** (`--info`): shows metadata without downloading.

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
