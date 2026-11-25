---
name: kata-video-template-design
description: Use when the user wants a new reusable video template (a "preset") or a finished video designed by AI in KATA TTS — choosing format, scene structure, layouts, colors, motion and voice lines, then saving it live to their account. Requires the KATA TTS connector (kata_* tools).
---

# Design KATA TTS video templates with AI

Templates are **data, not code**: a spec saved with `kata_save_video_template` appears immediately in the user's
web editor (Video → Mẫu video). Users then create projects from it, swap text and photos, generate voices and export.

Answer in the user's language (usually Vietnamese).

## Workflow

1. **Brief** (ask only what is missing, max 3 questions): goal and audience, platform/format, target length,
   brand colors or mood, whether the user will add their own photos/videos, call to action.
2. `kata_get_video_spec_reference` — the authoritative list of fields, layouts, transitions and limits.
   Optionally `kata_list_video_templates` / `kata_get_video_template` to start from a similar template.
3. **Structure** the video (see `references/recipes.md`):
   hook (1 scene) → body (1 scene per point) → call to action (1 scene). Scene count ≈ length ÷ 5 s.
4. **Design each scene**: layout, short on-screen text, background, text animation, transition, and a voice line.
   - 9:16: heading ≤ 7 words, body ≤ 14 words, text at `top` when captions are at the bottom.
   - 16:9: heading ≤ 9 words, body ≤ 20 words.
   - Contrast: light text on dark backgrounds; `overlayOpacity` 0.4–0.6 when text sits on photos.
   - Photos/videos the user will supply → an asset with `source: "placeholder"` and a clear `name`
     ("Ảnh sản phẩm", "Logo"), used as `background: { type: "media", assetId, motion: "zoom-in" }`.
   - Vary motion: alternate transitions (`fade`, `slide-left`, `push-left`) and text animations; keep one style family.
5. **Voice lines** follow the `kata-video-voice-sync` skill rules (spoken form, 8–25 words per scene).
   Do not set `generationId`/`durationSeconds`; templates never store audio.
6. **Save**: `kata_save_video_template(name, description, tags, spec)`. Read `warnings`: every warning means a value
   was adjusted — fix the spec and save again (pass `templateId` + `revision` to update your template).
7. **Show the result**: list the scenes in a short table (scene · on-screen text · voice line · ~seconds) and tell the
   user the template is in the editor. Offer to create a project from it (`kata_create_video_project` with `templateId`)
   and to continue with voices (voice-sync skill).

## Quality bar

- One message per scene; nothing important only in the voice (muted viewers) or only on screen (listeners).
- The hook scene works without context; the last scene says exactly what to do next.
- Never invent facts, prices or results; leave placeholders like "Tên sản phẩm" for the user to fill.
- Keep the total under the limit in the reference (default 180 s); short-form 15–60 s.
- Built-in templates are read-only — save a new template instead of editing them.
