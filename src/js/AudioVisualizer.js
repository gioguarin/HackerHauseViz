import * as THREE from 'three';
import SpaceTheme from './themes/SpaceTheme.js';
import DysonSphereTheme from './themes/DysonSphereTheme.js';
import GameOfLife from './effects/GameOfLife.js';
import NeonBanner from './effects/NeonBanner.js';

class AudioVisualizer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.audioSource = null;
        this.currentStream = null;
        this.currentMediaElement = null;
        this.selectedOutputDeviceId = null;
        this.currentObjectURL = null;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.currentTheme = null;

        this.sensitivity = 5;
        this.colorSpeed = 5;
        this.golEnabled = true;
        this.textEnabled = true;
        this.uiVisible = false;
        this.activeDnBButton = false;

        this.cinemaMode = false;  // Start with cinema mode OFF
        this.lastUserInteraction = 0;
        this.cinemaInactivityTimeout = 10000;
        this.rotationSpeed = 1; // 1 = normal, 0.5 = slow, 2 = fast

        this.fpsTime = 0;
        this.fpsFrames = 0;
        this.currentFPS = 60;

        this.init();
    }

    init() {
        this.setupThreeJS();
        this.setupBanner();
        this.setupUI();
        this.setupKeyboard();
        this.setupGameOfLife();

        this.currentTheme = new SpaceTheme(this.scene, this.camera);

        document.getElementById('loading').style.display = 'none';

        this.animate();
    }

    setupThreeJS() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        this.createStarfield();
        this.setupCameraControls();
        this.setupCinemaMode();

        window.addEventListener('resize', () => this.onResize());
    }

    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;

            const radius = 200 + Math.random() * 300;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            const brightness = 0.5 + Math.random() * 0.5;
            colors[i3] = brightness;
            colors[i3 + 1] = brightness;
            colors[i3 + 2] = brightness;

            sizes[i] = Math.random() * 2 + 0.5;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const starMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        this.starfield = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starfield);

        console.log('[Starfield] Created ' + starCount + ' stars');
    }

    setupCameraControls() {
        this.isDragging = false;
        this.previousTouch = null;
        this.cameraRotation = { x: 0, y: 0 };
        this.cameraDistance = 30;
        this.touchStartDistance = null;

        this.lastTapTime = 0;
        this.doubleTapThreshold = 300;
        this.autoRotateActive = false;
        this.autoRotateDirection = 1;

        const canvas = this.renderer.domElement;

        // Add double-click for auto-rotation
        canvas.addEventListener('dblclick', (e) => {
            e.preventDefault();
            this.toggleAutoRotation();
        });

        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousTouch = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.previousTouch.x;
            const deltaY = e.clientY - this.previousTouch.y;

            this.cameraRotation.y += deltaX * 0.005;
            this.cameraRotation.x += deltaY * 0.005;

            this.cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraRotation.x));

            this.updateCameraPosition();

            this.previousTouch = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraDistance += e.deltaY * 0.05;
            this.cameraDistance = Math.max(10, Math.min(100, this.cameraDistance));
            this.updateCameraPosition();
        });

        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const currentTime = Date.now();
                const timeSinceLastTap = currentTime - this.lastTapTime;

                if (timeSinceLastTap < this.doubleTapThreshold && timeSinceLastTap > 0) {
                    this.handleDoubleTap();
                    this.lastTapTime = 0;
                } else {
                    this.lastTapTime = currentTime;
                    this.isDragging = true;
                    this.previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                }
            } else if (e.touches.length === 2) {
                this.isDragging = false;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                this.touchStartDistance = Math.sqrt(dx * dx + dy * dy);
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();

            if (e.touches.length === 1 && this.isDragging) {
                const deltaX = e.touches[0].clientX - this.previousTouch.x;
                const deltaY = e.touches[0].clientY - this.previousTouch.y;

                this.cameraRotation.y += deltaX * 0.005;
                this.cameraRotation.x += deltaY * 0.005;

                this.cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraRotation.x));

                this.updateCameraPosition();

                this.previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2 && this.touchStartDistance) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const delta = this.touchStartDistance - distance;
                this.cameraDistance += delta * 0.1;
                this.cameraDistance = Math.max(10, Math.min(100, this.cameraDistance));

                this.updateCameraPosition();

                this.touchStartDistance = distance;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            this.isDragging = false;
            this.touchStartDistance = null;
        });
    }

    updateCameraPosition() {
        const x = this.cameraDistance * Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x);
        const y = this.cameraDistance * Math.sin(this.cameraRotation.x);
        const z = this.cameraDistance * Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(0, 0, 0);
    }

    handleDoubleTap() {
        if (this.autoRotateActive) {
            this.autoRotateActive = false;
            console.log('[DoubleTap] Auto-rotation stopped');
        } else {
            this.autoRotateActive = true;
            this.autoRotateDirection *= -1;
            console.log('[DoubleTap] Auto-rotation started - direction: ' + (this.autoRotateDirection > 0 ? 'clockwise' : 'counter-clockwise'));
        }
    }

    updateAutoRotate() {
        if (this.autoRotateActive || this.cinemaMode) {
            // Base rotation speed: 0.005 radians per frame
            const baseSpeed = 0.005;
            this.cameraRotation.y += baseSpeed * this.rotationSpeed * this.autoRotateDirection;
            this.updateCameraPosition();
        }
    }

    setupCinemaMode() {
        // Don't auto-disable cinema mode on interaction
        // It should only toggle with the C key
        console.log('[CinemaMode] Setup complete - use C key to toggle');
    }

    updateCinemaMode() {
        // Cinema mode is now controlled only by the C key
        // No automatic enabling/disabling
    }

    setupBanner() {
        this.banner = new NeonBanner();
    }

    setupGameOfLife() {
        this.gol = new GameOfLife(this.scene);
    }

    setupUI() {
        document.getElementById('mic-btn').addEventListener('click', () => {
            this.toggleMicDropdown();
        });

        document.getElementById('output-btn').addEventListener('click', () => {
            this.toggleOutputDropdown();
        });

        document.getElementById('refresh-devices-btn').addEventListener('click', () => {
            this.loadMicDevices();
            this.loadOutputDevices();
            this.detectActiveOutputDevice();
        });

        this.loadMicDevices();
        this.loadOutputDevices();

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.loadFile(e.target.files[0]);
        });

        document.getElementById('stream-btn').addEventListener('click', () => {
            const url = document.getElementById('stream-input').value;
            this.loadStream(url);
        });

        document.getElementById('dnb-stream-btn').addEventListener('click', () => {
            this.loadDnBStream();
        });

        document.getElementById('stop-btn').addEventListener('click', () => {
            this.stopAudio();
        });

        document.getElementById('sensitivity-slider').addEventListener('input', (e) => {
            this.sensitivity = parseInt(e.target.value);
            document.getElementById('sensitivity-value').textContent = this.sensitivity;
        });

        document.getElementById('color-speed-slider').addEventListener('input', (e) => {
            this.colorSpeed = parseInt(e.target.value);
            document.getElementById('color-speed-value').textContent = this.colorSpeed;
        });

        document.getElementById('gol-toggle').addEventListener('click', (e) => {
            this.golEnabled = !this.golEnabled;
            e.target.classList.toggle('active');
            this.gol.setVisible(this.golEnabled);
        });

        document.getElementById('text-toggle').addEventListener('click', (e) => {
            this.textEnabled = !this.textEnabled;
            e.target.classList.toggle('active');
            this.banner.setVisible(this.textEnabled);
        });

        document.getElementById('theme-btn').addEventListener('click', () => {
            this.switchTheme();
        });

        document.getElementById('custom-text-btn').addEventListener('click', () => {
            const input = document.getElementById('custom-text-input');
            const customText = input.value;

            if (customText.length > 500) {
                this.showError('Text too long (max 500 characters)');
                return;
            }

            const sanitized = customText.replace(/[^A-Za-z0-9\s.:\-]/g, '');

            if (sanitized.trim()) {
                this.banner.setText(sanitized);
                input.value = sanitized;
                console.log('[CustomText] Banner updated: ' + sanitized);
            } else {
                this.banner.resetText();
                input.value = '';
                console.log('[CustomText] Banner reset to default');
            }
        });

        document.getElementById('custom-text-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('custom-text-btn').click();
            }
        });

        document.getElementById('mobile-toggle-btn').addEventListener('click', () => {
            this.toggleUI();
        });
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleUI();
            } else if (e.code === 'KeyP') {
                this.switchTheme();
            } else if (e.code === 'KeyC') {
                e.preventDefault();
                this.toggleCinemaMode();
            } else if (e.code === 'BracketLeft' || e.code === 'Minus') {
                // [ or - key: Decrease rotation speed
                e.preventDefault();
                this.adjustRotationSpeed(-0.25);
            } else if (e.code === 'BracketRight' || e.code === 'Equal') {
                // ] or + key: Increase rotation speed
                e.preventDefault();
                this.adjustRotationSpeed(0.25);
            }
        });
    }

    adjustRotationSpeed(delta) {
        this.rotationSpeed = Math.max(0.25, Math.min(3, this.rotationSpeed + delta));
        const speedText = this.rotationSpeed === 1 ? 'Normal' :
                         this.rotationSpeed < 1 ? 'Slow' : 'Fast';
        this.showNotification(`Rotation Speed: ${speedText} (${this.rotationSpeed.toFixed(2)}x)`);
    }

    toggleAutoRotation() {
        this.autoRotateActive = !this.autoRotateActive;
        this.showNotification(`Auto-Rotation: ${this.autoRotateActive ? 'ON' : 'OFF'}`);
    }

    toggleCinemaMode() {
        this.cinemaMode = !this.cinemaMode;
        this.autoRotateActive = this.cinemaMode;

        const status = this.cinemaMode ? 'ON' : 'OFF';
        this.showNotification(`Cinema Mode: ${status}`);
    }

    showNotification(message) {
        // Show temporary notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 255, 0.2);
            border: 2px solid #0ff;
            color: #0ff;
            padding: 15px 30px;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            border-radius: 10px;
            z-index: 1000;
            pointer-events: none;
            animation: fadeOut 2s forwards;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        `;

        // Add fade animation if not already exists
        if (!document.getElementById('notification-style')) {
            const style = document.createElement('style');
            style.id = 'notification-style';
            style.textContent = `
                @keyframes fadeOut {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 2000);
    }

    async loadMicDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter(d => d.kind === 'audioinput');

            const container = document.getElementById('mic-devices');
            container.innerHTML = '';

            audioDevices.forEach(device => {
                const btn = document.createElement('button');
                btn.textContent = device.label || `Microphone ${device.deviceId.substr(0, 8)}`;
                btn.addEventListener('click', () => {
                    this.startMicrophone(device.deviceId);
                    this.toggleMicDropdown();
                });
                container.appendChild(btn);
            });
        } catch (error) {
            this.showError('Failed to load microphone devices: ' + error.message);
        }
    }

    toggleMicDropdown() {
        document.getElementById('mic-dropdown').classList.toggle('active');
    }

    toggleOutputDropdown() {
        document.getElementById('output-dropdown').classList.toggle('active');
    }

    async loadOutputDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

            const container = document.getElementById('output-devices');
            container.innerHTML = '';

            const defaultBtn = document.createElement('button');
            defaultBtn.textContent = 'Default Output';
            defaultBtn.addEventListener('click', () => {
                this.selectOutputDevice(null, 'Default Output');
                this.toggleOutputDropdown();
            });
            container.appendChild(defaultBtn);

            audioOutputs.forEach(device => {
                const btn = document.createElement('button');
                btn.textContent = device.label || `Speaker ${device.deviceId.substr(0, 8)}`;
                btn.addEventListener('click', () => {
                    this.selectOutputDevice(device.deviceId, btn.textContent);
                    this.toggleOutputDropdown();
                });
                container.appendChild(btn);
            });

            this.detectActiveOutputDevice();
        } catch (error) {
            this.showError('Failed to load output devices: ' + error.message);
        }
    }

    async detectActiveOutputDevice() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

            if (this.currentMediaElement && typeof this.currentMediaElement.sinkId !== 'undefined') {
                const activeSinkId = this.currentMediaElement.sinkId;

                if (activeSinkId === '') {
                    document.getElementById('audio-output').textContent = 'Default Output';
                } else {
                    const activeDevice = audioOutputs.find(d => d.deviceId === activeSinkId);
                    if (activeDevice) {
                        document.getElementById('audio-output').textContent = activeDevice.label || 'Unknown Device';
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to detect active output device:', error);
        }
    }

    async selectOutputDevice(deviceId, deviceName) {
        this.selectedOutputDeviceId = deviceId;
        document.getElementById('audio-output').textContent = deviceName;

        if (this.currentMediaElement && typeof this.currentMediaElement.setSinkId === 'function') {
            try {
                await this.currentMediaElement.setSinkId(deviceId || '');
            } catch (error) {
                this.showError('Failed to set output device: ' + error.message);
            }
        }
    }

    async startMicrophone(deviceId = null) {
        try {
            this.stopAudio();

            const constraints = {
                audio: deviceId ? { deviceId: { exact: deviceId } } : true
            };

            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);

            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            this.setupAnalyser();
            this.audioSource = this.audioContext.createMediaStreamSource(this.currentStream);
            this.audioSource.connect(this.analyser);

            const device = this.currentStream.getAudioTracks()[0];
            document.getElementById('audio-source').textContent = device.label || 'Microphone';

        } catch (error) {
            this.showError('Microphone access failed: ' + error.message);
        }
    }

    async loadFile(file) {
        if (!file) return;

        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('File too large (max 500MB)');
            return;
        }

        const allowedTypes = ['audio/', 'video/'];
        if (!allowedTypes.some(type => file.type.startsWith(type))) {
            this.showError('Invalid file type. Please upload audio or video files.');
            return;
        }

        try {
            this.stopAudio();

            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            this.setupAnalyser();

            const audio = new Audio();
            this.currentObjectURL = URL.createObjectURL(file);
            audio.src = this.currentObjectURL;
            audio.loop = true;
            this.currentMediaElement = audio;

            if (this.selectedOutputDeviceId && typeof audio.setSinkId === 'function') {
                try {
                    await audio.setSinkId(this.selectedOutputDeviceId);
                } catch (error) {
                    console.warn('Failed to set output device:', error);
                }
            }

            this.audioSource = this.audioContext.createMediaElementSource(audio);
            this.audioSource.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            await audio.play();

            document.getElementById('audio-source').textContent = file.name;
            this.detectActiveOutputDevice();

        } catch (error) {
            this.showError('File loading failed: ' + error.message);
        }
    }

    async loadDnBStream() {
        const streamUrl = 'http://65.108.124.70:7200/stream';
        const btn = document.getElementById('dnb-stream-btn');

        if (window.location.protocol === 'https:' && streamUrl.startsWith('http:')) {
            this.showError('⚠️ Mixed Content Error: Cannot load HTTP stream on HTTPS page. The D&B stream must be served over HTTPS to work on GitHub Pages.');
            return;
        }

        btn.disabled = true;
        btn.classList.add('loading');
        btn.textContent = '⏳ Connecting...';

        try {
            await this.loadStream(streamUrl);
            btn.textContent = '▶️ D&B Playing';
            btn.classList.remove('loading');
            btn.classList.add('active');
            this.activeDnBButton = true;
        } catch (error) {
            btn.disabled = false;
            btn.classList.remove('loading');
            btn.textContent = '🎵 Drum & Bass Radio';

            if (error.name === 'NotAllowedError') {
                this.showError('Audio playback blocked. Please interact with the page first, then try again.');
            } else if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
                this.showError('CORS Error: The stream server does not allow cross-origin access. Contact the radio station administrator.');
            } else if (error.message.includes('network') || error.message.includes('NetworkError')) {
                this.showError('Network Error: Cannot reach the D&B stream. Check if the radio station is online.');
            } else {
                this.showError('Failed to load D&B stream: ' + error.message);
            }
        }
    }

    validateURL(url) {
        try {
            const urlObj = new URL(url);
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                throw new Error('Only HTTP and HTTPS protocols are allowed');
            }
            if (url.length > 2048) {
                throw new Error('URL too long (max 2048 characters)');
            }
            return true;
        } catch (error) {
            throw new Error('Invalid URL: ' + error.message);
        }
    }

    async loadStream(url) {
        if (!url) {
            this.showError('Please enter a stream URL');
            return;
        }

        try {
            this.validateURL(url);
        } catch (error) {
            this.showError(error.message);
            return;
        }

        try {
            this.stopAudio();

            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.setupAnalyser();

            const audio = new Audio();
            audio.src = url;
            audio.crossOrigin = 'anonymous';
            audio.loop = false;
            this.currentMediaElement = audio;

            if (this.selectedOutputDeviceId && typeof audio.setSinkId === 'function') {
                try {
                    await audio.setSinkId(this.selectedOutputDeviceId);
                } catch (error) {
                    console.warn('Failed to set output device:', error);
                }
            }

            this.audioSource = this.audioContext.createMediaElementSource(audio);
            this.audioSource.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            await audio.play();

            const urlObj = new URL(url);
            document.getElementById('audio-source').textContent = `Stream: ${urlObj.hostname}`;
            this.detectActiveOutputDevice();

        } catch (error) {
            throw error;
        }
    }

    setupAnalyser() {
        if (this.analyser) {
            this.analyser.disconnect();
        }

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.analyser.smoothingTimeConstant = 0.8;
    }

    stopAudio() {
        if (this.audioSource) {
            this.audioSource.disconnect();
            this.audioSource = null;
        }

        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }

        if (this.currentMediaElement) {
            this.currentMediaElement.pause();
            this.currentMediaElement.src = '';
            this.currentMediaElement = null;
        }

        if (this.currentObjectURL) {
            URL.revokeObjectURL(this.currentObjectURL);
            this.currentObjectURL = null;
            console.log('[Memory] Object URL revoked');
        }

        const dnbBtn = document.getElementById('dnb-stream-btn');
        if (dnbBtn && this.activeDnBButton) {
            dnbBtn.disabled = false;
            dnbBtn.classList.remove('active', 'loading');
            dnbBtn.textContent = '🎵 Drum & Bass Radio';
            this.activeDnBButton = false;
        }

        document.getElementById('audio-source').textContent = 'None';
    }

    switchTheme() {
        if (this.currentTheme) {
            this.currentTheme.dispose();
        }

        if (this.currentTheme instanceof SpaceTheme) {
            this.currentTheme = new DysonSphereTheme(this.scene, this.camera);
            document.getElementById('current-theme').textContent = 'Dyson Sphere';
        } else {
            this.currentTheme = new SpaceTheme(this.scene, this.camera);
            document.getElementById('current-theme').textContent = 'Space';
        }
    }

    toggleUI() {
        this.uiVisible = !this.uiVisible;

        document.getElementById('control-panel').classList.toggle('visible');
        const mobileBtn = document.getElementById('mobile-toggle-btn');
        mobileBtn.textContent = this.uiVisible ? '✕' : '☰';
        mobileBtn.classList.toggle('active', this.uiVisible);

        // Only toggle status panel on desktop
        if (window.innerWidth > 768) {
            const statusPanel = document.querySelector('.status-panel');
            if (statusPanel) {
                statusPanel.classList.toggle('visible');
            }
        }
    }

    getFrequencyData() {
        if (!this.analyser) return { bass: 0, mid: 0, treble: 0, array: [] };

        this.analyser.getByteFrequencyData(this.dataArray);

        const bassEnd = Math.floor(this.bufferLength * 0.1);
        const midEnd = Math.floor(this.bufferLength * 0.4);

        let bass = 0, mid = 0, treble = 0;

        for (let i = 0; i < bassEnd; i++) bass += this.dataArray[i];
        for (let i = bassEnd; i < midEnd; i++) mid += this.dataArray[i];
        for (let i = midEnd; i < this.bufferLength; i++) treble += this.dataArray[i];

        bass = (bass / bassEnd / 255) * this.sensitivity;
        mid = (mid / (midEnd - bassEnd) / 255) * this.sensitivity;
        treble = (treble / (this.bufferLength - midEnd) / 255) * this.sensitivity;

        return {
            bass: Math.min(bass, 3),
            mid: Math.min(mid, 3),
            treble: Math.min(treble, 3),
            array: Array.from(this.dataArray)
        };
    }

    updateFPS() {
        this.fpsFrames++;
        const now = performance.now();
        if (now >= this.fpsTime + 1000) {
            this.currentFPS = Math.round((this.fpsFrames * 1000) / (now - this.fpsTime));
            this.fpsTime = now;
            this.fpsFrames = 0;
            document.getElementById('fps-counter').textContent = this.currentFPS;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const freqData = this.getFrequencyData();

        this.updateCinemaMode();
        this.updateAutoRotate();

        if (this.currentTheme) {
            this.currentTheme.update(freqData, this.colorSpeed);
        }

        if (this.golEnabled && this.gol) {
            this.gol.update(freqData.bass);
        }

        if (this.textEnabled && this.banner) {
            const avgAudio = (freqData.bass + freqData.mid + freqData.treble) / 3;
            this.banner.update(avgAudio, this.colorSpeed);
        }

        this.renderer.render(this.scene, this.camera);
        this.updateFPS();
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.banner) this.banner.onResize();
    }

    showError(message) {
        const errorEl = document.getElementById('error-message');
        const sanitized = String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 200);
        errorEl.textContent = sanitized;
        errorEl.style.display = 'block';
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }
}

export default AudioVisualizer;
