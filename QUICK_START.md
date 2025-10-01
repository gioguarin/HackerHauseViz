# Quick Start Guide

## 🎯 Which Version Should I Use?

There are **3 versions** of the visualizer:

| Version | File | Use Case | Dependencies |
|---------|------|----------|--------------|
| **Original** | `index.html` | Production, quick use | None ✅ |
| **CDN Modular** | `index-cdn.html` | Python server dev | None ✅ |
| **NPM Modular** | `index-modular.html` | Vite dev, build | npm ✅ |

## 🚀 Running the Visualizer

### Option 1: Original Single-File (Easiest)

**No setup required!** Just open the file:

```bash
open index.html
```

✅ Works in any browser
✅ No dependencies
✅ No server needed
✅ Perfect for quick testing

---

### Option 2: CDN Modular (Python Server)

Uses ES6 modules with Three.js from CDN:

```bash
python3 -m http.server 8000
# Open http://localhost:8000/index-cdn.html
```

✅ No npm dependencies
✅ Modular code structure
✅ Uses import maps (modern browsers)
⚠️ Requires Chrome 89+, Firefox 108+, Safari 16.4+

---

### Option 3: NPM Modular (Vite - Best for Development)

Uses ES6 modules with npm-installed Three.js:

```bash
# First time setup
npm install

# Start dev server
npm run dev:vite
# Vite will automatically open http://localhost:8000/index-modular.html
```

✅ Hot module replacement
✅ Fast refresh on code changes
✅ Production builds with `npm run build`
✅ Works with all browsers
⚠️ Requires Node.js and npm

---

## 🐛 Troubleshooting

### "Three.js failed to load" with Vite

**Solution**: Make sure you installed dependencies:
```bash
npm install
```

### "Cannot resolve module 'three'" with Python server

**Solution**: Use `index-cdn.html` instead of `index-modular.html`:
```bash
python3 -m http.server 8000
# Open http://localhost:8000/index-cdn.html
```

### Import maps not supported

**Solution**:
- Update to a modern browser (Chrome 89+, Firefox 108+, Safari 16.4+)
- OR use the original `index.html`
- OR use Vite: `npm run dev:vite`

---

## 📁 File Reference

```
HackerHauseViz/
├── index.html              ← Use this for quick testing
├── index-cdn.html          ← Use this with Python server
├── index-modular.html      ← Use this with Vite
└── src/                    ← Modular source code
    ├── js/
    └── css/
```

---

## 🎮 Quick Commands

**No dependencies**:
```bash
open index.html
```

**Python development**:
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000/index-cdn.html
```

**Vite development**:
```bash
npm install      # First time only
npm run dev:vite
```

**Production build**:
```bash
npm run build    # Creates ./dist/ folder
```

---

## ✨ Next Steps

Once you have it running:

1. Press `SPACE` to show/hide UI
2. Click 🎤 **Microphone** to start audio visualization
3. Press `P` to switch themes
4. Adjust **Sensitivity** slider for reactivity
5. Toggle **Game of Life** and **Story Text**

Enjoy! 🎵✨
