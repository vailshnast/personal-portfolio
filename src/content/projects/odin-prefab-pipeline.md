---
title: "Odin Prefab Pipeline"
blurb: "Unity editor content automation"
summary: "Editor tooling that generates, validates, and batches prefab variants from data tables."
category: "Tooling"
tags: ["Unity", "Odin", "C#", "Editor"]
status: "Internal"
statusTone: "neutral"
order: 3
thumb: "../../assets/media/odin-prefab-pipeline/thumb.jpg"
links:
  - {
      label: "Source",
      href: "https://github.com/vailshnast/odin-prefab-pipeline",
      type: "github",
    }
---

An in-house **Unity editor pipeline** (built on Odin Inspector) that turns
designer-authored data tables into validated prefab variants.

- One-click generation of prefab variants from CSV/ScriptableObject sources.
- **Validation pass** that flags missing references, broken materials, and naming drift.
- Batch operations across hundreds of prefabs with an undo-safe, progress-barred runner.

> This project intentionally ships **no video** — it demonstrates the graceful
> fallback path: the card shows the static thumbnail and the modal shows the poster
> (here, the thumbnail, since no dedicated poster is provided).
