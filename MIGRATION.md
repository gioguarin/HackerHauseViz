# Migration Guide: Single-File to Modular Architecture

This document explains the migration from the original single-file architecture to the new modular structure.

## 📊 Overview

The project has been refactored from a single 1,952-line HTML file into a modular ES6 architecture with better organization and maintainability.

## 🗂️ File Structure Comparison

### Before (v1.0)
```
HackerHauseViz/
├── index.html          # 1,952 lines (HTML + CSS + JS)
├── README.md
├── CLAUDE.md
├── package.json
└── vercel.json
```

### After (v2.0)
```
HackerHauseViz/
├── index.html              # Original (still available)
├── index-modular.html      # New modular entry point
├── src/
│   ├── js/
│   │   ├── AudioVisualizer.js     # 836 lines
│   │   ├── main.js                # 10 lines (entry point)
│   │   ├── themes/
│   │   │   ├── SpaceTheme.js      # 180 lines
│   │   │   └── DysonSphereTheme.js # 139 lines
│   │   └── effects/
│   │       ├── GameOfLife.js      # 218 lines
│   │       └── NeonBanner.js      # 132 lines
│   └── css/
│       └── styles.css             # 356 lines
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier configuration
├── vite.config.js          # Vite build configuration
├── LICENSE                 # MIT License
├── CONTRIBUTING.md         # Contribution guidelines
└── MIGRATION.md            # This file
```

## 🔄 What Changed?

### Code Organization

1. **CSS Extracted**: All styles moved to `src/css/styles.css`
2. **Modular JavaScript**: Classes split into separate ES6 modules
3. **Clean Separation**: Each theme and effect in its own file
4. **Build System**: Vite configuration for modern development

### Module Breakdown

| Original | Lines | Extracted To | Lines |
|----------|-------|--------------|-------|
| CSS | 357 | `src/css/styles.css` | 356 |
| AudioVisualizer | 827 | `src/js/AudioVisualizer.js` | 836 |
| SpaceTheme | 175 | `src/js/themes/SpaceTheme.js` | 180 |
| DysonSphereTheme | 134 | `src/js/themes/DysonSphereTheme.js` | 139 |
| GameOfLife | 213 | `src/js/effects/GameOfLife.js` | 218 |
| NeonBanner | 129 | `src/js/effects/NeonBanner.js` | 132 |
| Init Code | 8 | `src/js/main.js` | 10 |

## 🚀 Using the New Structure

### Development

**Option 1: Simple HTTP Server** (No dependencies)
```bash
python3 -m http.server 8000
# Open http://localhost:8000/index-modular.html
```

**Option 2: Vite Development Server** (Recommended)
```bash
npm install
npm run dev:vite
```

### Production Build

```bash
npm run build
# Output in ./dist/
```

The build process will:
- Bundle all modules into optimized files
- Minify CSS and JavaScript
- Generate source maps
- Optimize assets

## 🔧 Key Technical Changes

### 1. ES6 Modules

**Before:**
```javascript
// All in one <script> tag
class AudioVisualizer { ... }
class SpaceTheme { ... }
```

**After:**
```javascript
// AudioVisualizer.js
import SpaceTheme from './themes/SpaceTheme.js';
export default class AudioVisualizer { ... }

// SpaceTheme.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
export default class SpaceTheme { ... }
```

### 2. Import Maps

The modular version uses ES6 module imports:
```html
<script type="module" src="src/js/main.js"></script>
```

### 3. Three.js Import

**Before:** CDN script tag
```html
<script src="https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.min.js"></script>
```

**After:** ES6 module import
```javascript
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
```

## 📦 Package.json Updates

New scripts added:
```json
{
  "scripts": {
    "dev": "python3 -m http.server 8000",
    "dev:vite": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write \"src/**/*.{js,css,html}\""
  }
}
```

## ⚠️ Breaking Changes

None! The original `index.html` remains unchanged and fully functional.

## 🔀 Migration Path

### For Users
No action needed. Both versions work:
- **Single-file**: Open `index.html`
- **Modular**: Open `index-modular.html`

### For Developers

If you have local modifications:

1. **CSS Changes**: Update `src/css/styles.css` instead of `<style>` tag
2. **JavaScript Changes**: Edit the appropriate module in `src/js/`
3. **Build**: Run `npm run build` to generate production bundle

### For Deployment

**GitHub Pages** (current):
- Deploy `index.html` (original) - No changes needed
- Or deploy from `dist/` after running `npm run build`

**Other Platforms**:
```bash
npm run build
# Deploy the dist/ folder
```

## 🎯 Benefits of New Architecture

### Development
- ✅ **Better Organization**: Easy to find and edit specific features
- ✅ **Code Reusability**: Themes and effects can be imported elsewhere
- ✅ **Easier Debugging**: Source maps for each module
- ✅ **Hot Module Replacement**: Instant updates with Vite

### Maintenance
- ✅ **Smaller Files**: Easier to understand and review
- ✅ **Clear Dependencies**: Import statements show relationships
- ✅ **Better Testing**: Each module can be tested independently
- ✅ **Version Control**: Meaningful diffs for changes

### Collaboration
- ✅ **Reduced Conflicts**: Changes isolated to specific files
- ✅ **Clear Structure**: New contributors can navigate easily
- ✅ **Code Standards**: ESLint and Prettier enforce consistency

## 🐛 Troubleshooting

### Module Not Found Error
**Cause**: Server not serving ES6 modules correctly
**Solution**: Use `python3 -m http.server` or Vite, not file:// protocol

### THREE is not defined
**Cause**: Import statement missing
**Solution**: Add `import * as THREE from '...'` to the module

### CORS Error
**Cause**: Loading modules from file://
**Solution**: Use a local server (http://localhost)

## 📚 Further Reading

- [ES6 Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Vite Documentation](https://vitejs.dev/)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Architecture Documentation](./CLAUDE.md)

## ❓ Questions?

Open an issue on GitHub or refer to the [CONTRIBUTING.md](./CONTRIBUTING.md) guide.
