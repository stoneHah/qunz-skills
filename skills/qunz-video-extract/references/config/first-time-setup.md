# First-Time Setup

## Overview

When no EXTEND.md is found for `qunz-video-extract`, run this setup flow before proceeding.

## BLOCKING OPERATION

This setup **MUST** complete before any video extraction. Do NOT proceed without user input.

## Questions

Use `AskUserQuestion` with ALL questions in ONE call:

**Question 1** — header: "Output", question: "Default output directory?"
- "video-extract (Recommended)" — Save to ./video-extract/{slug}/video-{slug}.mp4
- (User may choose "Other" to type a custom path)

**Question 2** — header: "Save", question: "Where to save preferences?"
- "User (Recommended)" — ~/.baoyu-skills/ (all projects)
- "Project" — .baoyu-skills/ (this project only)

## Save Locations

| Choice | Path |
|--------|------|
| User | `$HOME/.baoyu-skills/qunz-video-extract/EXTEND.md` |
| Project | `.baoyu-skills/qunz-video-extract/EXTEND.md` |

## EXTEND.md Template

```yaml
# Video Extract Preferences
default_output_dir:
```

## Modifying Preferences Later

Edit or delete the EXTEND.md file at the saved location. Next run will detect missing file and re-trigger setup.
