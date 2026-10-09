# Camp cycle prompt set

## Shared background invariants

```text
Use case: lighting-weather
Input images: Image 1: exact base landscape and geometry to preserve
Asset type: wide TravelSplit interface background, one state in a four-state day cycle
Invariant geometry: preserve the exact camera position, crop, mountain silhouettes, cloud and fog placement, tree trunks, forest edges, path, rocks, tent position, tent shape, backpack and all object scale from Image 1
Required object: add one small permanent stone fire ring beside the tent in the same exact position across all states
Style/medium: retain the same sophisticated painterly realism, brush texture and natural depth
Constraints: no people; no text; no logos; no watermark; do not redesign or relocate the tent; do not add buildings or extra gear
```

### Morning delta

```text
Primary request: early morning with low cool sunrise from the left and soft diagonal sun rays through trees and mist
State rules: tent interior completely unlit; fire ring cold and fully extinguished; no smoke, flame, embers, stars or moon
```

### Day delta

```text
Primary request: clear daytime with high daylight and visible sunbeams through the canopy
State rules: tent interior completely unlit; fire ring cold and fully extinguished; no smoke, flame, embers, stars or moon
```

### Evening delta

```text
Primary request: quiet early evening with low warm sun, long amber rays and cool blue valley shadows
State rules: faint welcoming lamp glow beginning inside the tent; fire ring cold and fully extinguished; no stars or visible moon
```

### Night delta

```text
Primary request: clear peaceful night with moonlit forest, soft silver rim light, stars and a crescent moon
State rules: warm light inside the tent; a small controlled campfire in the fire ring; subtle firelight on nearby rocks and path
```

## Shared interface-compositing invariants

```text
Use case: compositing
Input images: Image 1: current TravelSplit interface and visual-system reference; Image 2: exact campsite background state
Primary request: use Image 2 as the full-screen background and preserve the current TravelSplit component family
Layout: keep the wordmark, celestial drag arc, greeting, active-trip card, smaller trip cards and create-trip action; keep cards in the left and center 65 percent so the tent, fire ring and path remain visible on the right
Constraints: preserve interface geometry, card positions, content, avatars, typography hierarchy and background geometry; no watermark
Avoid: covering the tent, moving the tent, sidebar, charts, dense cards, neon, excessive glassmorphism
```

### Interface state deltas

```text
Morning: sun handle near the left; greeting "Доброе утро, Анна"; warm off-white cards; tent and fire unlit.
Day: sun handle at the highest central point; greeting "Добрый день, Анна"; clean light cards; tent and fire unlit.
Evening: sun handle near the right; greeting "Добрый вечер, Анна"; warm stone cards; faint tent light; fire unlit.
Night: crescent moon handle at the far right; greeting "Доброй ночи, Анна"; deep navy cards with warm off-white text; tent light and campfire on; stars and moon visible.
```
