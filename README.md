# HackerHause Visualizer

![Deploy Status](https://github.com/gioguarin/HackerHauseViz/actions/workflows/deploy.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A professional, high-performance web-based 3D audio visualizer with interactive themes, built with Three.js and the Web Audio API. Features real-time audio analysis, multiple visualization themes, Game of Life background, and support for various audio input sources including microphone, files, and system audio loopback.

## 🚀 Live Demo

**[View Live Demo](https://gioguarin.github.io/HackerHauseViz/)**

## 📸 Screenshots

Experience immersive 3D audio visualization with multiple themes, real-time frequency analysis, and interactive controls.

## ✨ Features

### 🎵 Audio Input Sources
- 🎤 **Microphone** - Real-time audio visualization with device selection
- 📁 **Local Files** - Upload and visualize audio/video files
- 🔊 **Output Device Selection** - Route audio to Bluetooth speakers or any output device (Chrome/Edge only)
- 🎵 **Spotify/System Audio** - Visualize any desktop audio using system audio loopback (see setup guide below)

### 🎨 Visualization Themes

#### Space Theme
- 🌟 Central pulsating orb (bass-reactive)
- 💫 5 animated rings (mid/treble-reactive)
- ✨ 500 circular particles (individual frequency bin-reactive)
- 💡 Dynamic point lights

#### Dyson Sphere Theme
- ☀️ Central sun core (bass-reactive)
- 🛰️ 200 orbiting solar panels (individual frequency-reactive)
- 🌐 Wireframe outer shell (mid-frequency expansion)
- 🟡 Golden/orange color palette

### 🎭 Visual Effects

- **Conway's Game of Life Background** - 100x100 cellular automaton mapped to sphere, evolving with audio intensity
- **Neon Text Banner** - Scrolling pixel-art text with custom 5x4 bitmap font and audio-reactive glow
- **Color Cycling** - HSL color shifts synchronized with audio
- **Cinema Mode** - Hide all UI for immersive full-screen experience

### 🎮 Controls

#### Keyboard Shortcuts
- `SPACE` - Toggle UI visibility (cinema mode)
- `P` - Switch between themes

#### Sliders
- **Sensitivity** - Adjust audio reactivity intensity (1-10x)
- **Color Speed** - Control color cycling speed (1-10x)

#### Toggle Switches
- **Game of Life** - Enable/disable cellular automaton background
- **Story Text** - Enable/disable scrolling neon banner

#### Camera Controls
- **Desktop**: Click and drag to rotate, mouse wheel to zoom (10-100 units)
- **Mobile**: One finger swipe to rotate, pinch to zoom
- **Double-tap** (mobile) - Rotate camera 180° around the scene

#### UI Management
- Floating hamburger button (☰/✕) in bottom-left corner
- UI hidden by default for immersive full-screen experience
- Touch-optimized with 48px minimum touch targets

### ⚡ Performance

- 🎯 60 FPS target with real-time FPS counter
- 🔄 Throttled particle updates (10% per frame)
- ⏱️ Game of Life updates at 5 FPS (200ms intervals)
- 🧹 Proper Three.js resource disposal and memory management
- 📊 FFT analysis with 2048 samples (1024 frequency bins)

## Deployment

### GitHub Pages (Current Deployment)

This project is automatically deployed to GitHub Pages on every push to `main`:

**Live URL**: https://gioguarin.github.io/HackerHauseViz/

The deployment is handled by GitHub Actions (see `.github/workflows/deploy.yml`).

### Alternative: Deploy to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Deploy from this directory:
   ```bash
   vercel
   ```

3. For production deployment:
   ```bash
   vercel --prod
   ```

## 🛠️ Local Development

### Quick Start

Simply open [index.html](./index.html) in a modern web browser (Chrome recommended for full audio output device support).

**No build process, compilation, or dependencies required** - it's a single self-contained HTML file!

### Running with Local Server (Recommended)

For best performance and to avoid CORS issues when loading audio files:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (npx)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Project Structure

```
HackerHauseViz/
├── index.html          # Single-file application (HTML + CSS + JS)
├── CLAUDE.md          # Architecture documentation for AI assistants
├── README.md          # This file
├── .gitignore         # Git ignore patterns
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions deployment config
```

## Spotify Integration

**Note:** Spotify's Web Playback SDK does not expose raw audio data for real-time frequency analysis due to content protection. However, you can visualize Spotify playback using system audio loopback.

### macOS Setup (BlackHole)

1. Install BlackHole (free virtual audio driver):
   ```bash
   brew install blackhole-2ch
   ```

2. Create a Multi-Output Device:
   - Open **Audio MIDI Setup** (in `/Applications/Utilities/`)
   - Click **+** → **Create Multi-Output Device**
   - Check both **BlackHole 2ch** and your **output device** (speakers/headphones)
   - Right-click the Multi-Output Device → **Use This Device For Sound Output**

3. Set Spotify to use the Multi-Output Device in System Preferences

4. In the visualizer, select **BlackHole 2ch** as the microphone input

5. Play Spotify - the visualizer will now react to your Spotify audio!

### Windows Setup (VoiceMeeter)

1. Download and install [VoiceMeeter](https://vb-audio.com/Voicemeeter/) (free)

2. Configure VoiceMeeter:
   - Set **Hardware Output A1** to your physical audio device
   - Set Spotify output to **VoiceMeeter Input**

3. In the visualizer, select **VoiceMeeter Output** as the microphone input

4. Play Spotify - the visualizer will react to your audio!

### Linux Setup (PulseAudio)

1. Create a virtual sink:
   ```bash
   pactl load-module module-null-sink sink_name=visualizer
   ```

2. Create a loopback:
   ```bash
   pactl load-module module-loopback source=visualizer.monitor
   ```

3. Set Spotify output to "visualizer" in PulseAudio Volume Control

4. In the visualizer, select the visualizer monitor as microphone input

### Alternative: Desktop Audio Capture

If audio loopback seems complex, simply:
1. Play Spotify through your speakers
2. Use your **microphone** to capture the audio
3. Works immediately but quality depends on mic placement and room acoustics

## Browser Compatibility

- ✅ Chrome/Edge - Full support including audio output device selection
- ✅ Firefox/Safari - Works but no output device selection (setSinkId not supported)
- ✅ Mobile Browsers - Fully responsive with touch-optimized UI
- Requires: Web Audio API, WebGL, getUserMedia for microphone access

## Technical Details

- **Three.js** - 3D rendering engine
- **Web Audio API** - Real-time frequency analysis
- **HTML5 Canvas** - 2D text banner rendering
- **FFT Size** - 2048 (1024 frequency bins)
- **Frequency Split** - Bass (0-10%), Mid (10-40%), Treble (40-100%)

## 🏗️ Architecture

The application uses a modular class-based architecture with clear separation of concerns:

### Core Classes

- **`AudioVisualizer`** - Main controller orchestrating the entire application
  - Manages Web Audio API context and analyzers
  - Controls Three.js scene, camera, and renderer
  - Handles audio input sources (mic, file, system audio)
  - Frequency analysis with bass/mid/treble splitting
  - Theme switching and UI event coordination

- **`SpaceTheme`** - Space visualization implementation
  - Central pulsating orb (bass-reactive)
  - 5 animated rings (mid/treble-reactive)
  - 500 particles (frequency bin-reactive)

- **`DysonSphereTheme`** - Dyson sphere visualization
  - Central sun core
  - 200 orbiting solar panels
  - Wireframe expansion shell

- **`GameOfLife`** - Conway's Game of Life cellular automaton
  - 100x100 grid mapped to spherical surface
  - Audio-intensity cell spawning
  - Spherical coordinate wrapping

- **`NeonBanner`** - Scrolling pixel-art text renderer
  - Custom 5x4 bitmap font system
  - Canvas-based rendering
  - Audio-reactive color cycling

### Audio Processing Pipeline

```
Audio Source (Mic/File/System)
    ↓
Web Audio API AudioContext
    ↓
AnalyserNode (FFT: 2048, Smoothing: 0.8)
    ↓
Frequency Data Extraction (1024 bins)
    ↓
Frequency Split: Bass (0-10%), Mid (10-40%), Treble (40-100%)
    ↓
Normalized Values × Sensitivity Multiplier (1-10x)
    ↓
All Active Visualizers
```

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation and development guidelines.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Adding New Features

See [CLAUDE.md](./CLAUDE.md) for guidelines on:
- Adding new visualization themes
- Creating new audio sources
- Implementing new visual effects

## 📝 License

MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/) - 3D rendering library
- Uses [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) for real-time audio analysis
- Inspired by music visualizers and Conway's Game of Life

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ for the audio visualization community**