# Writing Vietnamese voice lines for KATA TTS

## Two kinds of text — never mix them
| Text | Where | How |
|---|---|---|
| Voice line | `scene.voice.text` | Written so TTS **says it right**: numbers in words, acronyms spelled out |
| On-screen text | `heading`, `body`, `bullets` | Correct original spelling: HACCP, 033.335.6603, 20% |

Captions are generated from the voice line, so with captions on prefer words that also read well on screen
(keep brand names in their original spelling when the user says so).

## Acronyms
- Certifications and abbreviations in a Vietnamese context: spell with Vietnamese letter names —
  A, Bê, Xê, Đê, E, Ép, Giê, Hát, I, Ca, E-lờ, Em-mờ, En-nờ, O, Pê, Kiu, E-rờ, Ét-xì, Tê, U, Vê, Vê-kép, Ích-xì, I-dài, Dét.
- Tech terms Vietnamese people read the English way: AI → ây-ai, API → ây-pi-ai, GPT → gi-pi-ti.
- If the brand owner has chosen a reading, use exactly that. If unsure, ask the user.

## Common readings
| Written | Spoken |
|---|---|
| online | on-lai |
| brand | bờ-ran |
| file / link | phai / linh |
| Google Drive | gu-gồ đờ-rai |
| ChatGPT | chát-gi-pi-ti |
| espresso | ét-pre-xô |
| KATA | Ca-ta |

## Numbers
- Always in words: `tám mươi ba phẩy năm`, `ba sao`.
- Phone numbers in groups with commas: `không ba ba, ba ba năm, sáu sáu không ba`.
- Prices: `một trăm chín mươi nghìn đồng`.

## Style for short videos
- Short sentences. First sentence is a hook (curiosity in 3 seconds).
- Use Vietnamese words when they exist: miễn phí, tải lên, máy chủ.
- Do not repeat the same word in two consecutive sentences.
- Put a familiar word before an unusual foreign word; TTS can swallow rare words after "cả… lẫn".

## Checklist before generating
1. Every English word / acronym has a spoken form (new ones: ask the user to approve).
2. Numbers and phone numbers are in words.
3. One idea per scene; total length fits the target.
4. On-screen text still matches the meaning, in correct spelling.
