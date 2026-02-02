# Skill Templates

This directory contains templates for creating new skills in the baoyu-skills repository.

## Template Types

### 1. SKILL_TEMPLATE_SCRIPTS.md

**For skills with local scripts** (9 skills in current repository)

**When to use**: When your skill requires local TypeScript scripts to be executed

**Key features**:
- Includes `## Script Directory` section (mandatory)
- Assumes existence of `scripts/` subdirectory
- Agent needs to execute scripts via `npx -y bun ${SKILL_DIR}/scripts/...`
- Includes Workflow section with multi-step process
- Includes Gallery sections for styles/layouts
- Has File Structure documentation

**Examples in repository**:
- baoyu-comic
- baoyu-compress-image
- baoyu-post-to-x
- baoyu-slide-deck
- baoyu-image-gen

**Front matter pattern**:
```yaml
name: baoyu-{skill-name}
description: {description}. Use when user asks to "{trigger-keyword}"
```

---

### 2. SKILL_TEMPLATE_NO_SCRIPTS.md

**For pure Claude skills** (4 skills in current repository)

**When to use**: When your skill is triggered via IDE commands and uses only Claude's capabilities

**Key features**:
- **NO** `## Script Directory` section
- **NO** local `scripts/` directory
- Triggered via `/baoyu-{skill-name}` commands in IDE
- Pure Claude workflow execution
- Includes Gallery sections
- Has File Structure documentation

**Examples in repository**:
- baoyu-cover-image (your discovery!)
- baoyu-article-illustrator
- baoyu-infographic
- baoyu-xhs-images

**Front matter pattern**:
```yaml
name: baoyu-{skill-name}
description: {description}. Use when user asks to "{trigger-keyword}"
```

---

### 3. SKILL_TEMPLATE_CLI.md

**For CLI tools with special requirements** (1 skill in current repository)

**When to use**: When your skill is a command-line tool that:
- Uses non-official APIs (reverse-engineered)
- Requires user consent/disclaimer
- Serves as backend for other skills
- Has special authentication needs

**Key features**:
- Includes ⚠️ **Disclaimer section** (mandatory)
- Includes `## Script Directory` section
- Detailed consent flow documentation
- Authentication section
- Environment variables documentation
- Proxy configuration (if applicable)
- Commands organized by category

**Examples in repository**:
- baoyu-danger-gemini-web

**Front matter pattern**:
```yaml
name: baoyu-danger-{tool-name}
description: {description}. Supports {features}. Use as backend for other skills
```

---

## How to Choose the Right Template

### Decision Tree

1. **Does your skill need local scripts?**
   - ✅ Yes → Use `SKILL_TEMPLATE_SCRIPTS.md`
   - ❌ No → Continue to #2

2. **Is it a pure Claude skill triggered by `/command`?**
   - ✅ Yes → Use `SKILL_TEMPLATE_NO_SCRIPTS.md`
   - ❌ No → Continue to #3

3. **Does it use non-official APIs or require user consent?**
   - ✅ Yes → Use `SKILL_TEMPLATE_CLI.md`
   - ❌ No → Use `SKILL_TEMPLATE_SCRIPTS.md`

### Quick Reference

| Feature | Scripts | No Scripts | CLI Tool |
|---------|---------|------------|----------|
| Local `scripts/` dir | ✅ Yes | ❌ No | ✅ Yes |
| `## Script Directory` | ✅ Yes | ❌ No | ✅ Yes |
| ⚠️ Disclaimer | ❌ No | ❌ No | ✅ Yes |
| Trigger via `/command` | ❌ No | ✅ Yes | ❌ No |
| Trigger via `npx -y bun` | ✅ Yes | ❌ No | ✅ Yes |
| Workflow steps | ✅ Yes | ✅ Yes | ❌ No |
| Gallery sections | ✅ Yes | ✅ Yes | ❌ No |
| Authentication docs | Optional | Optional | ✅ Yes |
| Proxy config | Optional | Optional | ✅ Often |

---

## Template Structure

### Common Sections (All Templates)

1. **YAML Front Matter**
   - `name`: Skill identifier
   - `description`: One-line description with trigger keywords

2. **Main Heading**
   - H1 with display name

3. **Usage/Quick Start**
   - Examples of how to use the skill

4. **Options**
   - Table of available options

5. **Gallery Sections** (for content skills)
   - Style Gallery
   - Layout Gallery

6. **Auto Selection** (optional)
   - Content signals to option mapping

7. **File Structure**
   - Output directory structure
   - Slug generation rules
   - Conflict resolution

8. **Extension Support**
   - EXTEND.md mechanism (identical in all skills)

### Template-Specific Sections

#### Scripts Template Adds:
- `## Script Directory` (mandatory)
- Multi-step **Workflow**
- Modification support

#### No Scripts Template Adds:
- Extended **Workflow** with detailed Claude instructions
- Pure IDE command execution

#### CLI Template Adds:
- `## ⚠️ Disclaimer` section (mandatory)
- Consent check flow (5 steps)
- Authentication section
- Environment variables
- Proxy configuration
- **Commands** (instead of Workflow)

---

## Usage Checklist

When creating a new skill using these templates:

### All Templates
- [ ] Update YAML front matter with correct name and description
- [ ] Update all `{placeholders}` with actual values
- [ ] Customize Usage/Quick Start examples
- [ ] Update Options table with actual options
- [ ] Customize Gallery sections (if applicable)
- [ ] Update File Structure section with correct paths
- [ ] Review and customize Extension Support section
- [ ] Test the skill after creation

### Scripts Template Only
- [ ] Create `scripts/` directory with TypeScript files
- [ ] Verify Script Reference table matches actual scripts
- [ ] Test script execution with `npx -y bun`

### No Scripts Template Only
- [ ] Verify no `scripts/` directory exists
- [ ] Ensure skill is triggered via `/command` format
- [ ] Test IDE command execution

### CLI Template Only
- [ ] Customize Disclaimer with actual risks
- [ ] Implement consent check in code
- [ ] Add Authentication section if needed
- [ ] Document all environment variables
- [ ] Add proxy configuration if needed

---

## Examples Mapping

### Scripts Template Examples

**Skill**: baoyu-comic
**Key features**:
- Has `scripts/` directory
- Has `## Script Directory` section
- Uses Workflow with 5 steps
- Has Style and Layout galleries

### No Scripts Template Examples

**Skill**: baoyu-cover-image
**Key features**:
- No `scripts/` directory
- No `## Script Directory` section
- Triggered via `/baoyu-cover-image` command
- Has Workflow with 7 steps
- Has Style Gallery

**Skill**: baoyu-xhs-images
**Key features**:
- No `scripts/` directory
- No `## Script Directory` section
- Triggered via `/baoyu-xhs-images` command
- Complex Workflow with multiple variants
- Has both Style and Layout galleries

### CLI Template Example

**Skill**: baoyu-danger-gemini-web
**Key features**:
- Has `scripts/` directory
- Has `## Script Directory` section
- Has `## ⚠️ Disclaimer` section
- Uses Commands instead of Workflow
- Has Authentication section
- Documents environment variables
- Includes Proxy configuration

---

## Maintenance

When updating these templates:

1. Review all existing skills to ensure template still matches patterns
2. Check for newly added sections or patterns
3. Update templates to reflect current best practices
4. Document any breaking changes
5. Test templates by creating example skills

---

## Contributing

If you create a new skill type that doesn't fit these templates:

1. Document the new pattern
2. Consider creating a new template
3. Update this README with the new template
4. Share the pattern with the team
