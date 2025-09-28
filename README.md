# Hacker House Audio Visualizer

A professional, high-performance web-based 3D audio visualizer with interactive themes, built with Three.js and Web Audio API.

## Features

### Audio Input Sources
- 🎤 **Microphone** - Real-time audio visualization with device selection
- 📁 **Local Files** - Upload audio/video files
- 🔊 **Output Device Selection** - Route audio to Bluetooth speakers or any output device
- 🎵 **Spotify Integration** - Visualize Spotify playback using system audio loopback (see setup guide below)

### Visualization Themes

#### Space Theme
- Central pulsating orb (bass-reactive)
- 5 animated rings (mid/treble-reactive)
- 500 circular particles (frequency bin-reactive)
- Dynamic point lights

#### Dyson Sphere Theme
- Central sun core (bass-reactive)
- 200 orbiting solar panels (individual frequency-reactive)
- Wireframe outer shell (mid-frequency expansion)
- Golden/orange color palette

### Visual Effects

- **Conway's Game of Life Background** - 100x100 grid evolving with audio intensity
- **Neon Text Banner** - Scrolling pixel-art text with custom bitmap font and audio-reactive glow
- **Post-processing** - Neon glow effects and color cycling

### Controls

- **Sensitivity Slider** - Adjust audio reactivity (1-10)
- **Color Speed Slider** - Control color cycling speed (1-10)
- **Toggle Buttons** - Enable/disable Game of Life and Story Text
- **Keyboard Shortcuts**:
  - `SPACE` - Toggle UI visibility
  - `P` - Switch between themes

### Performance

- 60 FPS target with real-time FPS counter
- Efficient particle system updates
- Throttled Game of Life updates (200ms intervals)
- Proper Three.js resource management

## Deployment

### Deploy to Vercel

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

### Or Deploy via Vercel Dashboard

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Deploy (no build configuration needed)

## Local Development

Simply open `index.html` in a modern web browser (Chrome recommended for full audio output device support).

No build process or dependencies required - it's a single self-contained HTML file.

### Running with Local Server

For best performance and to avoid CORS issues:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

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
- Requires: Web Audio API, WebGL, getUserMedia for microphone access

## Technical Details

- **Three.js** - 3D rendering engine
- **Web Audio API** - Real-time frequency analysis
- **HTML5 Canvas** - 2D text banner rendering
- **FFT Size** - 2048 (1024 frequency bins)
- **Frequency Split** - Bass (0-10%), Mid (10-40%), Treble (40-100%)

## Architecture

The application uses a modular class-based architecture:
- `AudioVisualizer` - Main controller
- `SpaceTheme` / `DysonSphereTheme` - Visualization themes
- `GameOfLife` - Conway's Game of Life background
- `NeonBanner` - Scrolling text banner

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.

## License

MIT