# Troubleshooting Guide

## Three.js Loading Errors

### Problem: "Three.js failed to load" or "Cannot find module 'three'"

The modular version has been fixed with the following solutions:

#### ✅ Solution 1: Using Python HTTP Server (Recommended)

The `index-modular.html` now includes an **import map** that tells the browser where to find Three.js:

```html
<script type="importmap">
{
    "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js"
    }
}
</script>
```

**To run**:
```bash
python3 -m http.server 8000
# Open http://localhost:8000/index-modular.html
```

**Browser Support**: Import maps work in Chrome 89+, Edge 89+, Safari 16.4+, Firefox 108+

#### ✅ Solution 2: Using Vite

If you want to use Vite with npm installed Three.js:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run Vite dev server**:
   ```bash
   npm run dev:vite
   ```

Vite will automatically handle the module resolution.

### Common Errors and Fixes

#### Error: "Uncaught TypeError: Failed to resolve module specifier 'three'"

**Cause**: Browser doesn't support import maps or file is opened with `file://` protocol

**Fix**:
- Use a local HTTP server (not `file://`)
- Update to a modern browser that supports import maps
- Or use the original `index.html` which doesn't require modules

#### Error: "CORS policy blocking Three.js CDN"

**Cause**: Browser CORS restrictions

**Fix**: Use a local HTTP server, not opening files directly

#### Error: "THREE is not defined"

**Cause**: Import statement missing or incorrect

**Fix**: Ensure all files that use Three.js have:
```javascript
import * as THREE from 'three';
```

### Testing Your Setup

1. **Open browser console** (F12)
2. **Navigate to** `http://localhost:8000/index-modular.html`
3. **Check for errors**

Expected console output:
```
AudioVisualizer initialized
Space theme loaded
```

### Browser Compatibility

| Browser | Import Maps | Status |
|---------|-------------|--------|
| Chrome 89+ | ✅ Yes | Fully supported |
| Edge 89+ | ✅ Yes | Fully supported |
| Firefox 108+ | ✅ Yes | Fully supported |
| Safari 16.4+ | ✅ Yes | Fully supported |
| Older browsers | ❌ No | Use original index.html |

## Other Common Issues

### Issue: "Cannot read property 'getContext' of null"

**Cause**: Canvas element not found

**Fix**: Ensure you're loading `index-modular.html`, not the old `index.html`

### Issue: Audio not playing

**Cause**: User interaction required for Web Audio API

**Fix**: Click on one of the audio input buttons first (Microphone, File, etc.)

### Issue: UI not showing

**Cause**: UI is hidden by default

**Fix**:
- Press `SPACE` key to toggle UI
- Click the hamburger button (☰) in bottom-left corner

### Issue: Performance is slow / Low FPS

**Possible causes**:
1. Too many particles (Game of Life + Theme particles)
2. Older GPU
3. Multiple browser tabs open

**Fixes**:
- Disable Game of Life (toggle button)
- Close other browser tabs
- Use a simpler theme
- Update graphics drivers

## Testing Checklist

After fixing Three.js imports, verify:

- [ ] Page loads without console errors
- [ ] Black canvas with 3D scene visible
- [ ] Microphone button works
- [ ] File upload works
- [ ] Theme switching works (press P)
- [ ] Game of Life animates
- [ ] Banner text scrolls
- [ ] FPS counter shows ~60 FPS
- [ ] UI toggles with SPACE key

## Getting Help

If you're still having issues:

1. **Check browser console** for specific error messages
2. **Verify you're using a local HTTP server** (not file://)
3. **Test with the original** `index.html` to isolate the issue
4. **Open an issue** on GitHub with:
   - Browser name and version
   - Error messages from console
   - Steps to reproduce

## Quick Reference

### Working Configurations

✅ **Python + Chrome**:
```bash
python3 -m http.server 8000
# Open http://localhost:8000/index-modular.html in Chrome 89+
```

✅ **Vite + Any Browser**:
```bash
npm install
npm run dev:vite
# Vite handles everything automatically
```

✅ **Original Version** (no modules):
```bash
# Simply open index.html in any browser
open index.html
```

### Module Import Patterns

**Correct** ✅:
```javascript
import * as THREE from 'three';  // Uses import map
```

**Incorrect** ❌:
```javascript
import * as THREE from 'https://...';  // Direct CDN URL (causes CORS)
```

---

**Last Updated**: October 1, 2025
