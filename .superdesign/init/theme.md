# Theme summary

- Background: `#050810`; deep surface `#0a1018`
- Primary accent: cyan `#4adede`; dim cyan `#2a8a8a`
- Status: red `#ff4d4d`; amber `#ffb84d`; success green is locally `#5ab669`
- Text: primary `#e8f4f8`; secondary `#8aa0b0`; muted `#4a6070`
- Sans: Inter / Space Grotesk / system; mono: JetBrains Mono
- Shape: cards generally 12–16px radius; pills fully rounded
- Effects: translucent dark glass, 16–20px backdrop blur, subtle cyan borders, restrained glows
- Layout: max width `72rem`; page gutters 24px mobile / 48px desktop
- Motion: reveal on intersection, restrained tilt/glare, slow background rotation, count-up metrics

## Raw theme source

```css
@import "tailwindcss";
@theme {
  --color-space-bg: #050810;
  --color-space-deep: #0a1018;
  --color-cyan-glow: #4adede;
  --color-cyan-dim: #2a8a8a;
  --color-alert-red: #ff4d4d;
  --color-alert-amber: #ffb84d;
  --color-text-primary: #e8f4f8;
  --color-text-secondary: #8aa0b0;
  --color-text-muted: #4a6070;
  --font-sans: "Inter", "Space Grotesk", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
body { background:#050810; color:#e8f4f8; font-family:"Inter","Space Grotesk",system-ui,sans-serif; overflow-x:hidden; margin:0; }
.glass { background:linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.02) 50%,rgba(255,255,255,.04)); backdrop-filter:blur(16px) saturate(140%); border:1px solid rgba(255,255,255,.08); box-shadow:0 8px 32px rgba(0,0,0,.4),inset 0 1px rgba(255,255,255,.06); }
.glass-dark { background:linear-gradient(160deg,rgba(10,16,24,.78),rgba(8,12,20,.82) 50%,rgba(12,18,28,.76)); backdrop-filter:blur(20px) saturate(120%); border:1px solid rgba(74,222,222,.1); box-shadow:0 8px 40px rgba(0,0,0,.55),inset 0 1px rgba(255,255,255,.04); }
.glass-clear { background:rgba(255,255,255,.03); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.06); }
```
