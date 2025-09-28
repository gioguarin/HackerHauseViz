# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file web-based 3D audio visualizer built with Three.js and the Web Audio API. The visualizer provides real-time audio-reactive animations with multiple themes, effects, and audio input sources.

## Running the Application

Simply open `index.html` in a modern web browser (Chrome recommended for full audio output device support). No build process, compilation, or dependencies to install.

For best performance and to avoid CORS issues, run with a local server:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`

## Architecture

The application is structured as a single self-contained HTML file with inline CSS and JavaScript. All code follows an object-oriented class-based architecture:

### Core Classes

- **AudioVisualizer** (main controller) - Orchestrates the entire application, manages audio context, analyzers, Three.js scene, UI events, and coordinates updates between all subsystems. Handles audio input sources (microphone, file, YouTube), frequency analysis (bass/mid/treble splitting), and theme switching.

- **SpaceTheme** - Implements the space visualization with a central pulsating orb (bass-reactive), 5 animated rings (mid/treble-reactive), 500 particles in circular formation (frequency bin-reactive), and dynamic point lights. Objects are stored for disposal management.

- **DysonSphereTheme** - Implements a Dyson sphere visualization with a central sun (bass-reactive), 200 orbiting solar panels (individually frequency-reactive), and a wireframe shell (mid-frequency expansion). Uses golden/orange color palette.

- **GameOfLife** - Conway's Game of Life implementation mapped onto a spherical surface (radius 35) using a Three.js Points mesh. Updates every 200ms, with audio intensity spawning new cells. Grid is 100x100 cells using spherical coordinates (phi/theta) to wrap around the scene. Alive cells pulse outward slightly from the sphere surface for 3D depth effect.

- **NeonBanner** - Scrolling pixel-art text banner using custom 5x4 bitmap fonts rendered on HTML5 Canvas. Color-cycles with audio reactivity, implements glow effects, and handles pixel-perfect scrolling. Character patterns are stored in a font dictionary.

### Audio Processing Flow

1. Audio source (mic/file) → Web Audio API AudioContext
2. AudioContext → AnalyserNode (FFT size 2048, smoothing 0.8)
3. AnalyserNode → Frequency data extraction
4. Frequency split: Bass (0-10%), Mid (10-40%), Treble (40-100%)
5. Normalized values scaled by sensitivity slider (1-10x multiplier)
6. Frequency data passed to all active visualizers

### Theme System

Themes are swappable via the `switchTheme()` method. Each theme must implement:
- Constructor accepting `(scene, camera)`
- `update(freqData, colorSpeed)` method called every frame
- `dispose()` method to clean up Three.js resources (geometries, materials, scene objects)

New themes should follow this pattern and be instantiated in `switchTheme()`.

### Audio Input Sources

**Supported Input Methods:**
1. **Microphone** - Direct microphone capture with device selection dropdown
2. **Audio/Video Files** - Local file upload with Web Audio API analysis
3. **Spotify/System Audio (via Loopback)** - Capture any desktop audio using virtual audio devices

**Audio Output Device Selection:**
The visualizer supports output device selection using the `HTMLMediaElement.setSinkId()` API (Chrome/Edge only). When a user selects an output device:
- The device ID is stored in `selectedOutputDeviceId`
- For file/media playback, `setSinkId()` is called on the Audio element
- Microphone input always uses the system default (browser limitation)
- "Refresh Devices" button re-enumerates devices and detects active output

**Spotify Integration (System Audio Loopback):**
While Spotify's Web Playback SDK does not expose raw audio data for analysis, users can visualize Spotify playback by:
- **macOS**: Installing BlackHole virtual audio driver and creating a Multi-Output Device
- **Windows**: Using VoiceMeeter to route Spotify audio to a virtual input
- **Linux**: Using PulseAudio null sink and loopback module

The visualizer then captures this looped-back audio via the microphone input API, enabling real-time Spotify visualization without direct API integration.

## Key Technical Details

- **Performance**: Particle updates are throttled (10% per frame), Game of Life updates at 5 FPS, proper object pooling with disposal
- **Three.js Scene**: Standard PerspectiveCamera at z=30, WebGLRenderer with antialias, responsive resize handling
- **Frequency Analysis**: Uses `getByteFrequencyData()` with 1024 frequency bins, split into bass/mid/treble ranges
- **Color System**: HSL color cycling driven by `time` variable, scaled by `colorSpeed` slider
- **UI State**: All UI visibility controlled by class toggles, keyboard shortcuts (SPACE=toggle UI, P=switch theme)

## Adding New Features

**New Visualization Theme:**
1. Create a new class extending the theme pattern (constructor, update, dispose)
2. Add instantiation logic in `AudioVisualizer.switchTheme()`
3. Update the theme display in status panel

**New Audio Source:**
1. Add UI controls in the HTML control panel
2. Implement audio loading method in `AudioVisualizer`
3. Call `setupAnalyser()` and connect source to analyser
4. Update `audio-source` status display
5. Call `detectActiveOutputDevice()` to update status panel

**Important Note on Audio Sources:**
Direct integration with streaming services (Spotify, YouTube, etc.) is not possible due to:
- Content protection (DRM)
- CORS restrictions on audio streams
- API limitations (no raw audio data exposure)

The system audio loopback approach is the recommended workaround for visualizing protected audio content.

**New Visual Effect:**
1. For 3D effects: Add to theme classes, create Three.js objects in constructor
2. For 2D effects: Create new Canvas-based class similar to `NeonBanner`
3. Instantiate in `AudioVisualizer.init()` and call update in `animate()` loop

## Browser Compatibility

- Chrome/Edge: Full support including audio output device selection
- Firefox/Safari: Works but no output device selection (setSinkId not supported)
- Requires: Web Audio API, WebGL, getUserMedia for microphone access