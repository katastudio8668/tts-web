---
name: kata-video-voice-sync
description: Use when the user wants a voice-over that matches a KATA TTS video — writing or fixing scene voice lines, generating the scene voices, fitting scene timing and captions to the voice, and exporting the MP4. Requires the KATA TTS connector (kata_* tools).
---

# Sync voice with a KATA TTS video

A KATA video is a list of scenes. Each scene can have **one voice line**. When a voice is generated,
the scene is stretched to `lead + voice length + tail`, and captions are timed to the voice. So the way to
"match voice and picture" is: one idea per scene, one short voice line per scene, then let KATA fit the timing.

Answer in the user's language (usually Vietnamese).

## Workflow

1. **Find the project.** `kata_list_video_projects` → `kata_get_video_project`. Keep the returned `revision`.
   If the user has no project yet, use the `kata-video-template-design` skill or `kata_create_video_project` from a template first.
2. **Read the rules once:** `kata_get_video_spec_reference` (fields, limits, voice-writing rules).
3. **Write or fix the voice lines** (`scene.voice.text`), one per scene, following *Voice lines* below.
   Make sure on-screen text (heading/body/bullets) shows the same idea in correct spelling.
4. **Pick a voice.** `kata_list_voices`. Set `defaultVoiceId` (or `scene.voice.voiceId` for a different speaker).
   TTS Group 2 voices are more natural and understand `[cười] [thở dài] [hắng giọng]`; Group 1 voices skip those cues.
5. **Save** with `kata_update_video_project(projectId, revision, spec)`. Send the full spec. For scenes whose voice text
   and voice did not change, keep `generationId`, `textHash` and `durationSeconds` exactly as read so their audio is reused.
   On a conflict error, read the project again and re-apply your change.
6. **Estimate and ask.** `kata_estimate_scene_voices` → tell the user the number of voices, characters and credits
   (weekly free credits are used first). **Do not continue without a clear yes.**
7. **Generate.** `kata_sync_scene_voices(projectId, confirmCredits: true)`; call it again until `progress.done`.
   - `blockedReason` about credits → stop and tell the user (link: the Plans page).
   - `failed` scenes → they are retried on the next call; if one keeps failing, shorten or rephrase that line.
8. **Check timing.** Read the project: `status.durationSeconds` must fit the target length (≤ 180 s). If too long,
   shorten lines (≈ 2.5–3 words per second of speech) and repeat from step 5 — only changed scenes cost credits again.
9. **Export.** `kata_render_video_project(projectId, requestId)` saves to the user's Google Drive, then poll
   `kata_get_render_status` (~30 s). If it returns `rendered: false` (local media files, or no Drive), give the user
   the `editorUrl`: they render in the web editor, which saves into their own folder.

## Voice lines

- One idea per scene, 1–2 short sentences, about **8–25 words** (3–8 seconds). The first scene is a hook, not a list.
- Write it the way it is **spoken**: numbers in words (`hai mươi phần trăm`), phone numbers in groups with commas,
  acronyms spelled as they are read. See `references/voice-writing.md`.
- Short reel style; no chains of "rồi… rồi…"; avoid "nó" for the product; talk to the viewer ("bạn").
- Only claims the user gave you or that are on their product; never invent prices, ratings or certifications.
- Emotion cues (`[cười]`, `[thở dài]`, `[hắng giọng]`) at most once or twice per video, only with Group 2 voices.

## Captions

Turn on `captions.enabled` for social videos (most people watch muted). `karaoke` highlights words as they are
spoken; `bottom` position for 16:9, `bottom` or `center` for 9:16. Captions show the voice text without cues.
