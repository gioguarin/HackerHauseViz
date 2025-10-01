# Contributing to HackerHause Visualizer

Thank you for your interest in contributing to the HackerHause Visualizer! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/HackerHauseViz.git
   cd HackerHauseViz
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Using the Original Single-File Version
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

### Using the Modular Version (Recommended for Development)
```bash
# Option 1: Simple HTTP server
python3 -m http.server 8000
# Open http://localhost:8000/index-modular.html

# Option 2: With Vite (install dependencies first)
npm install
npm run dev:vite
```

## 📁 Project Structure

```
HackerHauseViz/
├── index.html              # Original single-file version (production)
├── index-modular.html      # Modular version (development)
├── src/
│   ├── js/
│   │   ├── AudioVisualizer.js     # Main controller
│   │   ├── main.js                # Entry point
│   │   ├── themes/
│   │   │   ├── SpaceTheme.js
│   │   │   └── DysonSphereTheme.js
│   │   └── effects/
│   │       ├── GameOfLife.js
│   │       └── NeonBanner.js
│   └── css/
│       └── styles.css
└── package.json
```

## 🎨 Code Style

We use ESLint and Prettier for code formatting:

```bash
# Lint your code
npm run lint

# Format your code
npm run format
```

### Style Guidelines

- **Indentation**: 4 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Naming**:
  - Classes: `PascalCase`
  - Functions/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

## 🧪 Testing

Currently, the project doesn't have automated tests. When contributing:

1. Test your changes in multiple browsers (Chrome, Firefox, Safari)
2. Test on both desktop and mobile devices
3. Verify audio input works with:
   - Microphone
   - Audio files
   - Video files
4. Check performance (FPS should remain at ~60)

## 📝 Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(themes): add matrix rain theme

Add a new Matrix-style falling text theme with green characters
and audio-reactive cascade speed.

Closes #123
```

```
fix(audio): resolve microphone permission denial handling

Properly catch and display user-friendly error when microphone
access is denied by the user.
```

## 🎯 Adding New Features

### Adding a New Theme

1. Create a new file in `src/js/themes/YourTheme.js`
2. Implement the theme class:
   ```javascript
   import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';

   class YourTheme {
       constructor(scene, camera) {
           this.scene = scene;
           this.camera = camera;
           // Initialize your theme objects
       }

       update(freqData, colorSpeed) {
           // Update animation based on audio data
       }

       dispose() {
           // Clean up Three.js resources
       }
   }

   export default YourTheme;
   ```
3. Import and add to `AudioVisualizer.js` in the `switchTheme()` method
4. Update documentation in [CLAUDE.md](./CLAUDE.md)

### Adding a New Visual Effect

1. Create a new file in `src/js/effects/YourEffect.js`
2. Implement the effect class with `update()` method
3. Import and instantiate in `AudioVisualizer.js`
4. Add UI controls in `index-modular.html`

## 🐛 Reporting Issues

When reporting issues, please include:

- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots/videos (if applicable)

## 💡 Suggesting Features

Feature suggestions are welcome! Please:

1. Check existing issues first
2. Clearly describe the feature and use case
3. Provide mockups or examples if possible

## 📋 Pull Request Process

1. Update documentation if needed (README.md, CLAUDE.md)
2. Ensure code follows style guidelines
3. Test thoroughly on multiple browsers/devices
4. Update CHANGELOG.md (if it exists)
5. Create a pull request with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/GIFs of visual changes

## 🔒 Security

If you discover a security vulnerability, please email giovannyguarin@gmail.com instead of opening a public issue.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Questions?

Feel free to open a discussion or issue if you have questions!

---

**Thank you for contributing to HackerHause Visualizer!** 🎵✨
