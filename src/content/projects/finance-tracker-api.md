---
title: "Finance Tracker API"
blurb: "Personal-finance REST backend"
summary: "Production .NET 8 REST API with JWT auth, EF Core, and a full integration test suite."
category: "Backend"
tags: [".NET 8", "C#", "PostgreSQL", "EF Core", "Docker"]
status: "Production"
statusTone: "blue"
order: 2
thumb: "../../assets/media/finance-tracker-api/thumb.jpg"
poster: "../../assets/media/finance-tracker-api/poster.jpg"
previewMp4: "/media/finance-tracker-api/preview.mp4"
previewWebm: "/media/finance-tracker-api/preview.webm"
fullMp4: "/media/finance-tracker-api/full.mp4"
fullWebm: "/media/finance-tracker-api/full.webm"
links:
  - {
      label: "Source",
      href: "https://github.com/vailshnast/finance-tracker-api",
      type: "github",
    }
  - {
      label: "API docs",
      href: "https://example.com/finance-tracker/docs",
      type: "demo",
    }
---

A **.NET 8** REST API for tracking accounts, transactions, and budgets, designed
as a clean reference backend.

- **JWT authentication** with refresh tokens and role-based authorization.
- **EF Core** over PostgreSQL with migrations and a repository/service split.
- Budget rollups and recurring-transaction projection computed server-side.
- A full **integration test suite** running against an ephemeral Dockerized database in CI.
