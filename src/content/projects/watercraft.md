---
title: "WaterCraft"
blurb: "Unity boat game on the Entitas ECS framework"
category: "PC"
tags: ["Unity", "C#", "Entitas", "ECS", "URP"]
status: "Open Source"
statusTone: "blue"
platform: "PC"
order: 2
thumb: "../../assets/media/watercraft/banner.jpg"
youtube: "https://youtu.be/pDEecBeLHmA"
links:
  - {
      label: "Source on GitLab",
      href: "https://gitlab.com/vailshnast/watercraft",
      type: "gitlab",
    }
---

A Unity game built as a deep dive into **data-oriented design** — the whole project runs on
the [Entitas](https://github.com/sschmid/Entitas) entity-component-system framework with
[Jenny](https://github.com/sschmid/Jenny) code generation, rather than the conventional
MonoBehaviour-per-object approach.

**Architecture highlights:**

- **Entitas ECS** — game state lives in components on entities; behaviour lives in systems,
  cleanly separated from the data they act on
- **Jenny code generation** — contexts, components, and lookups are generated rather than
  hand-written, cutting the ECS boilerplate
- **Feature-based systems** — logic is grouped into self-contained features (animation,
  buildings, tweening, lifecycle) and ordered across the Update / Fixed / Late phases
- **URP** rendering with a low-poly water environment and post-processing

A C# hobby project focused on getting comfortable with ECS in Unity — modelling gameplay as
streams of components and systems, and leaning on code generation to keep the wiring
maintainable.
