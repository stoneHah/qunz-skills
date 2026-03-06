# EXTEND.md Schema

Structure for user preferences in `.baoyu-skills/qunz-video-extract/EXTEND.md`.

## Full Schema

```yaml
# Video Extract Preferences

## Defaults
default_output_dir:              # path or empty (default: ./video-extract/)
```

## Field Descriptions

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `default_output_dir` | string | empty | Default output directory (empty = `./video-extract/`) |

## Minimal Examples

### Change default output directory

```yaml
default_output_dir: ~/Videos/downloads
```

## File Locations

Priority order (first found wins):

1. `.baoyu-skills/qunz-video-extract/EXTEND.md` (project)
2. `$HOME/.baoyu-skills/qunz-video-extract/EXTEND.md` (user)
