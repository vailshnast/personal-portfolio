---
title: "Innerspace"
blurb: "VR/XR simulation software for pharmaceutical training"
summary: "Immersive VR/XR training simulations for the pharmaceutical industry — built in Unity at Innerspace GmbH, where operators rehearse real production and cleanroom procedures hands-on inside a faithfully modelled facility."
category: "eLearning"
tags: ["Unity", "C#", "VR", "XR", "Simulation", "Serious Game"]
status: "Shipped"
statusTone: "blue"
platform: "VR"
order: 2
thumb: "../../assets/media/innerspace/banner.jpg"
youtube: "https://youtu.be/IgE0U5uKjTA"
---

VR/XR simulation software for **pharmaceutical training**, built in Unity during my time as a
Senior Unity Developer at **Innerspace GmbH**. Instead of classroom slides or shadowing a
colleague, operators put on a headset and step straight onto the production floor — working a
faithfully modelled filling and packaging line, handling equipment, and rehearsing the exact
procedures they'll perform for real, with mistakes safe to make and repeat.

The simulations turn dense GMP and process documentation into hands-on practice: learners move
through each step in sequence, interact with the machinery, and get immediate in-world feedback,
so the muscle memory and the theory are built together rather than bolted on afterwards.

Beyond the gameplay itself, much of my work was on the engineering that kept the studio shipping:

- **Build & release automation** — owned CI/CD as Unity DevOps on **TeamCity**, maintaining the
  team's automated build pipelines end to end
- **Module-creation editor tool** — cut new-module setup from a full day to under an hour, and
  **automated recorded VR test runs** so regressions surfaced without manual headset passes
- **Localization pipeline** — a dedicated **Avalonia** desktop app that made designers
  independent of developers and removed a recurring workflow bottleneck
- **Internal .NET tools and services** — built around Avalonia, AWS, Crowdin, and ElevenLabs

Delivered in cross-functional international teams, with a steady focus on scalable architecture
and workflow optimization.
