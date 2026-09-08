---
name: skeleton-slashers-style
description: Estilo de programación y arquitectura para el proyecto Phaser de Skeleton Slashers.
---

# Estilo de programación de Skeleton Slashers

## 1. Stack y arquitectura base
- El proyecto usa TypeScript + Phaser 4 + Vite.
- La lógica principal vive en `src/`, separada por capas funcionales: `entities`, `abilities`, `systems`, `scenes`, `weapons`, `maps` e `input`.
- La estructura típica de un sistema es: `Scene` coordina el mundo, `Actor` encapsula el estado del personaje, `AbilitySystem` gestiona habilidades y `Weapon` representa ataques temporales.
- Se prefieren patrones orientados a objetos ligeros sobre lógica dispersa en callbacks o funciones globales.

## 2. Convenciones de nombres
- Clases y tipos: `PascalCase` (`GameScene`, `AbilitySystem`, `DungeonMap`, `AutoAimAbility`).
- Métodos, propiedades y variables: `camelCase` (`getMovementInput`, `updateAbilities`, `activeWeapons`).
- Ficheros: nombrados con `PascalCase` cuando representan clases (`Actor.ts`, `Player.ts`, `GameScene.ts`) y directorios en minúsculas (`entities`, `abilities`, `systems`).
- Identificadores descriptivos y específicos; evitar abreviaturas ambiguas salvo las ya asentadas en el dominio (`delta`, `x`, `y`, `id`).

## 3. Tipado y seguridad de tipos
- Mantener TypeScript explícito en argumentos, propiedades y retornos.
- Preferir `readonly` y `private`/`protected` para estado inmutable o interno.
- No usar `any` salvo obligación excepcional y documentada.
- Si una operación puede fallar, preferir una comprobación explícita y mensajes de error claros en español.
- Cuando una clase tiene un estado crítico, encapsularlo dentro del objeto y exponer acceso mínimo.

## 4. Patrones de implementación preferidos
- Las escenas se construyen con `preload()`, `create()` y `update(delta)`.
- Los actores son responsables de su estado físico, vida, animación y activación de habilidades.
- Los sistemas de gameplay deben vivir en clases con ciclo de vida propio: `AbilitySystem` gestiona la concesión, activación y actualización de habilidades.
- Los ataques temporales deben ser objetos descartables (`Weapon`) con `active`/`destroy()` y sin duplicar la lógica de colisión en varias capas.
- Si el comportamiento afecta al mundo, se centraliza en su clase responsable en lugar de distribuirlo por otras escenas.

## 5. Estilo de código
- Mantener funciones y métodos pequeños, con una única responsabilidad.
- Usar `const` para valores inmutables y `let` solo cuando el valor realmente cambia.
- Favorcer `return` temprano para validar estados no válidos.
- Evitar magic numbers: agrupar valores relevantes en propiedades o constantes con nombre descriptivo.
- Acotar comentarios a JSDoc o notas breves sobre comportamiento no obvio; el código debe ser legible por sí mismo.
- Escribe comentarios en español y nombres en una mezcla clara de español/inglés manteniendo consistencia con el dominio del juego.

## 6. Reglas de juego y comportamiento
- La mecánica del combate debe respetar el flujo: entrada, movimiento, activación de habilidad, resolución del daño, animación y actualización de estado.
- Los actores deben reaccionar a eventos del mundo (`damaged`, `died`, `weapon-created`) de forma controlada y sin duplicar efectos.
- La colisión y la cámara deben integrarse con el mapa y el mundo del juego; no dejar valores hardcodeados que rompan la escena.
- Cuando se añadan nuevas habilidades, deben seguir el patrón de `GameplayAbility` y registrarse con `AbilitySystem`.

## 7. Convenciones de estilo visual del proyecto
- El código tiende a usar `this.` para referirse al estado interno y a la escena activa.
- Se favorecen objetos con inicialización explícita en el constructor y demás lógica en métodos dedicados.
- Las animaciones y tweens de Phaser deben ir cerca del comportamiento del actor o escena que las utiliza.
- Evitar mezclar lógica de render, física y gameplay en un único método si ya existe una capa natural para cada una.

## 8. Validación antes de entregar cambios
- Para cambios de código, ejecutar al menos `npm run build` para validar el proyecto.
- Si se altera la lógica de combate, movimiento o estados del actor, verificar que no rompe la sincronización entre `update()`, habilidades y armas.
- Mantener la arquitectura del proyecto consistente: no introducir utilidades globales si ya existe un mecanismo de sistema/actor para ese comportamiento.

## 9. Resumen de la filosofía
El proyecto prioriza claridad, encapsulación y patrones reutilizables sobre complejidad artificial. El código debe ser fácil de seguir en una pantalla: cada clase tiene un papel claro, cada actualización de gameplay está en su sitio y cada entidad del mundo sabe cómo actuar sin depender de lógica dispersa.
