---
name: skeleton-slashers-style
description: Concise coding and architecture rules for Skeleton Slashers.
---

# Project Style

- Use TypeScript, Phaser 4, and Vite.
- Keep gameplay in `src/`, split into `entities`, `abilities`, `systems`, `scenes`, `weapons`, `maps`, and `input`.
- Let `Scene` coordinate, `Actor` own character state, `AbilitySystem` manage abilities, and `Weapon` handle temporary attacks.
- Use `PascalCase` for classes and class files; `camelCase` for members, methods, and variables; lowercase directories.
- Prefer explicit types, `readonly`, and `private`/`protected`. Avoid `any`.
- Keep methods small and single-purpose. Prefer early returns and named constants over magic numbers.
- Keep gameplay logic in its owning class; avoid global utilities and duplicated collision logic.
- New abilities must extend `GameplayAbility` and be granted through `AbilitySystem`.
- Keep Phaser animation, physics, and rendering close to the owning actor or scene.
- Comment only non-obvious behavior; use English comments and identifiers.
- Run `npm run build` before delivering code changes.
