import * as THREE from 'three';

class DysonSphereTheme {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.objects = [];
        this.lights = [];
        this.beams = [];
        this.time = 0;

        console.log('DysonSphereTheme: Initializing with 3 layers and beams');
        this.createSun();
        this.createPanels();
        this.createShell();
        this.createLights();
        this.createBeams();
        console.log(`DysonSphereTheme: Created ${this.panels.length} panels and ${this.beams.length} beam objects`);
    }

    createSun() {
        const geometry = new THREE.SphereGeometry(4, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff8800,
            emissive: 0xff8800,
            emissiveIntensity: 1,
            metalness: 0.5,
            roughness: 0.3
        });
        this.sun = new THREE.Mesh(geometry, material);
        this.scene.add(this.sun);
        this.objects.push(this.sun);
    }

    createPanels() {
        this.panels = [];

        // Create panel group for easier management
        this.panelGroup = new THREE.Group();

        // Three layers of panels at different radii
        const layers = [
            { radius: 8, panelSize: 0.8, opacity: 0.9 },   // Inner layer
            { radius: 12, panelSize: 1.2, opacity: 0.85 },  // Middle layer
            { radius: 16, panelSize: 1.4, opacity: 0.8 }    // Outer layer
        ];

        const numRings = 10;  // Number of latitude rings per layer
        const basePanelsPerRing = 16;  // Base panels per ring

        layers.forEach((layer, layerIndex) => {
            // Offset the starting positions for each layer to avoid overlap
            const thetaOffset = (layerIndex * Math.PI) / 6; // 30 degree offset per layer

            for (let ringIndex = 0; ringIndex < numRings; ringIndex++) {
                // Calculate latitude (phi) for uniform distribution
                const phi = (Math.PI * (ringIndex + 1)) / (numRings + 1);

                // Adjust panels per ring based on latitude to maintain uniform spacing
                const ringRadius = Math.sin(phi);
                const adjustedPanelsPerRing = Math.floor(basePanelsPerRing * ringRadius) || 1;

                for (let panelIndex = 0; panelIndex < adjustedPanelsPerRing; panelIndex++) {
                    // Calculate longitude (theta) with offset for each layer
                    const theta = (2 * Math.PI * panelIndex) / adjustedPanelsPerRing + thetaOffset;

                    // Create square panel geometry
                    const geometry = new THREE.BoxGeometry(layer.panelSize, layer.panelSize, 0.1);

                    // Vary the color slightly for each layer
                    const hueShift = layerIndex * 10;
                    const material = new THREE.MeshStandardMaterial({
                        color: new THREE.Color().setHSL((30 + hueShift) / 360, 1, 0.5),
                        emissive: new THREE.Color().setHSL((30 + hueShift) / 360, 1, 0.4),
                        emissiveIntensity: 0.3,
                        metalness: 0.9,
                        roughness: 0.1,
                        transparent: true,
                        opacity: layer.opacity,
                        side: THREE.DoubleSide
                    });

                    const panel = new THREE.Mesh(geometry, material);

                    // Calculate position on sphere
                    const x = layer.radius * Math.sin(phi) * Math.cos(theta);
                    const y = layer.radius * Math.cos(phi); // Y based on latitude
                    const z = layer.radius * Math.sin(phi) * Math.sin(theta);

                    panel.position.set(x, y, z);

                    // Orient panel to face center (normal to sphere surface)
                    panel.lookAt(0, 0, 0);

                    this.panelGroup.add(panel);
                    this.panels.push({
                        mesh: panel,
                        initialTheta: theta,
                        theta: theta,
                        phi: phi,
                        layerIndex: layerIndex,
                        ringIndex: ringIndex,
                        panelIndex: panelIndex,
                        // Vary speed slightly by layer - inner layers move faster
                        speed: 0.002 - (layerIndex * 0.0003) + (ringIndex * 0.00005),
                        radius: layer.radius,
                        baseRadius: layer.radius
                    });
                    this.objects.push(panel);
                }
            }
        });

        this.scene.add(this.panelGroup);
    }

    createShell() {
        const geometry = new THREE.SphereGeometry(22, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        this.shell = new THREE.Mesh(geometry, material);
        this.scene.add(this.shell);
        this.objects.push(this.shell);
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0x402000);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        const sunLight = new THREE.PointLight(0xff8800, 2, 100);
        this.scene.add(sunLight);
        this.lights.push(sunLight);
    }

    createBeams() {
        // Pre-create a pool of beam objects for performance
        const maxBeams = 10;

        for (let i = 0; i < maxBeams; i++) {
            // Create beam group for main beam + glow effect
            const beamGroup = new THREE.Group();

            // Main beam - increased size by 15%
            const mainGeometry = new THREE.CylinderGeometry(0.06, 0.17, 1, 8);
            const mainMaterial = new THREE.MeshBasicMaterial({
                color: 0xffdd00,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending
            });
            const mainBeam = new THREE.Mesh(mainGeometry, mainMaterial);

            // Glow effect - larger, softer beam
            const glowGeometry = new THREE.CylinderGeometry(0.15, 0.35, 1, 8);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending
            });
            const glowBeam = new THREE.Mesh(glowGeometry, glowMaterial);

            beamGroup.add(mainBeam);
            beamGroup.add(glowBeam);
            beamGroup.visible = false;
            this.scene.add(beamGroup);

            this.beams.push({
                mesh: beamGroup,
                mainBeam: mainBeam,
                glowBeam: glowBeam,
                active: false,
                startTime: 0,
                duration: 0,
                sourcePanel: null,
                impactPoint: null,
                originalPanelEmissive: null,
                opacity: 0
            });

            this.objects.push(beamGroup);
        }

        // Create impact points on the sun
        this.impactPoints = [];
        for (let i = 0; i < maxBeams; i++) {
            const geometry = new THREE.SphereGeometry(0.5, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending
            });
            const impact = new THREE.Mesh(geometry, material);
            impact.visible = false;
            this.scene.add(impact);
            this.impactPoints.push(impact);
            this.objects.push(impact);
        }
    }

    activateBeam(panelData) {
        // Find an inactive beam
        const beamIndex = this.beams.findIndex(b => !b.active);
        if (beamIndex === -1) return;

        const beam = this.beams[beamIndex];
        const impactPoint = this.impactPoints[beamIndex];

        // Calculate beam position and orientation
        const panelPos = panelData.mesh.position;
        const centerPos = new THREE.Vector3(0, 0, 0);

        // Position beam between panel and center
        beam.mesh.position.copy(panelPos).multiplyScalar(0.5);

        // Orient beam to point from panel to center
        beam.mesh.lookAt(centerPos);
        beam.mesh.rotateX(Math.PI / 2); // Adjust for cylinder orientation

        // Scale beam length to reach from panel to near center
        const distance = panelPos.length();
        beam.mesh.scale.set(1, distance * 0.9, 1);

        // Store original panel emissive intensity
        beam.originalPanelEmissive = panelData.mesh.material.emissiveIntensity;

        // Position impact point on sun surface
        const sunRadius = 4.2; // Slightly larger than sun
        const direction = panelPos.clone().normalize();
        impactPoint.position.copy(direction).multiplyScalar(sunRadius);
        impactPoint.visible = true;
        beam.impactPoint = impactPoint;

        // Activate beam
        beam.active = true;
        beam.startTime = this.time;
        beam.duration = 0.5 + Math.random() * 1.5; // 0.5 to 2 seconds
        beam.sourcePanel = panelData;
        beam.mesh.visible = true;
        beam.opacity = 0;
    }

    update(freqData, colorSpeed) {
        this.time += 0.01 * colorSpeed;

        if (this.sun) {
            const scale = 1 + freqData.bass * 0.4;
            this.sun.scale.set(scale, scale, scale);
            this.sun.material.emissiveIntensity = 1 + freqData.bass * 0.5;
        }

        // Randomly activate beams based on audio intensity
        // Increased probability for testing - was 0.05, now 0.15
        if (Math.random() < Math.max(0.02, freqData.bass * 0.15) && this.panels.length > 0) {
            const randomPanel = this.panels[Math.floor(Math.random() * this.panels.length)];
            this.activateBeam(randomPanel);
        }

        this.panels.forEach((panelData, i) => {
            // All panels orbit horizontally (around Y axis) in the same direction
            panelData.theta += panelData.speed * colorSpeed;

            // Calculate new position maintaining sphere formation
            // Different expansion for each layer based on frequency ranges
            let radiusExpansion = 0;
            if (panelData.layerIndex === 0) {
                // Inner layer responds to bass
                radiusExpansion = freqData.bass * 1.5;
            } else if (panelData.layerIndex === 1) {
                // Middle layer responds to mid frequencies
                radiusExpansion = freqData.mid * 2;
            } else {
                // Outer layer responds to treble
                radiusExpansion = freqData.treble * 2.5;
            }

            const radius = panelData.baseRadius + radiusExpansion;

            // Standard spherical to Cartesian conversion
            // phi (latitude) stays constant, theta (longitude) changes for horizontal orbit
            const x = radius * Math.sin(panelData.phi) * Math.cos(panelData.theta);
            const y = radius * Math.cos(panelData.phi); // Y based on latitude (stays constant)
            const z = radius * Math.sin(panelData.phi) * Math.sin(panelData.theta);

            panelData.mesh.position.set(x, y, z);

            // Maintain orientation towards center (panels always face inward)
            panelData.mesh.lookAt(0, 0, 0);

            // Audio-reactive panel scaling and glow
            if (i < freqData.array.length) {
                const intensity = freqData.array[i] / 255;

                // Scale panels uniformly to maintain square shape
                const scale = 1 + intensity * 0.25;
                panelData.mesh.scale.set(scale, scale, scale * 0.1); // Keep depth thin

                // Adjust emissive intensity based on frequency
                panelData.mesh.material.emissiveIntensity = 0.3 + intensity * 0.6;

                // Color variation based on layer and frequency
                const baseHue = 30 + (panelData.layerIndex * 10); // Base color per layer
                const hue = baseHue + intensity * 20; // Frequency modulation
                panelData.mesh.material.emissive.setHSL(hue / 360, 1, 0.5);
            }
        });

        if (this.shell) {
            const scale = 1 + freqData.mid * 0.1;
            this.shell.scale.set(scale, scale, scale);
            this.shell.rotation.y += 0.0005 * colorSpeed;
            this.shell.material.opacity = 0.2 + freqData.treble * 0.2;
        }

        // Update beam animations
        this.beams.forEach(beam => {
            if (!beam.active) return;

            const elapsed = this.time - beam.startTime;
            const progress = elapsed / beam.duration;

            if (progress >= 1) {
                // Deactivate beam and restore panel
                beam.active = false;
                beam.mesh.visible = false;
                beam.opacity = 0;

                // Reset beam materials
                beam.mainBeam.material.opacity = 0;
                beam.glowBeam.material.opacity = 0;

                // Restore panel emissive
                if (beam.sourcePanel && beam.originalPanelEmissive !== null) {
                    beam.sourcePanel.mesh.material.emissiveIntensity = beam.originalPanelEmissive;
                }

                // Hide impact point
                if (beam.impactPoint) {
                    beam.impactPoint.visible = false;
                    beam.impactPoint.material.opacity = 0;
                }
            } else {
                // Animate beam opacity (fade in quickly, then fade out)
                if (progress < 0.2) {
                    beam.opacity = progress * 5; // Fade in
                } else {
                    beam.opacity = 1 - ((progress - 0.2) / 0.8); // Fade out
                }

                // Update beam materials
                beam.mainBeam.material.opacity = beam.opacity * 0.9;
                beam.glowBeam.material.opacity = beam.opacity * 0.3;

                // Make source panel glow brighter
                if (beam.sourcePanel) {
                    const panelPos = beam.sourcePanel.mesh.position;

                    // Brighten panel when firing
                    beam.sourcePanel.mesh.material.emissiveIntensity =
                        beam.originalPanelEmissive + (beam.opacity * 1.5);

                    // Make panel more white when firing
                    const hue = 30 + (beam.opacity * 30); // Shift toward yellow-white
                    beam.sourcePanel.mesh.material.emissive.setHSL(hue / 360, 1 - beam.opacity * 0.5, 0.5 + beam.opacity * 0.3);

                    // Update beam position if panel moved
                    beam.mesh.position.copy(panelPos).multiplyScalar(0.5);

                    // Re-orient beam
                    const centerPos = new THREE.Vector3(0, 0, 0);
                    beam.mesh.lookAt(centerPos);
                    beam.mesh.rotateX(Math.PI / 2);

                    // Update beam length
                    const distance = panelPos.length();
                    beam.mesh.scale.set(1, distance * 0.9, 1);
                }

                // Animate impact point
                if (beam.impactPoint) {
                    beam.impactPoint.material.opacity = beam.opacity * 0.8;

                    // Pulse the impact point size
                    const pulseScale = 1 + Math.sin(elapsed * 20) * 0.3 * beam.opacity;
                    beam.impactPoint.scale.set(pulseScale, pulseScale, pulseScale);

                    // Color shift for impact
                    beam.impactPoint.material.color.setHSL(
                        45 / 360, // Yellow-white
                        1,
                        0.8 + beam.opacity * 0.2
                    );
                }
            }
        });
    }

    dispose() {
        // Clean up panel group
        if (this.panelGroup) {
            this.scene.remove(this.panelGroup);
        }

        // Clean up impact points
        if (this.impactPoints) {
            this.impactPoints.forEach(impact => {
                if (impact.geometry) impact.geometry.dispose();
                if (impact.material) impact.material.dispose();
                this.scene.remove(impact);
            });
        }

        // Clean up all objects
        this.objects.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
            if (obj.parent) obj.parent.remove(obj);
        });

        // Clean up lights
        this.lights.forEach(light => {
            this.scene.remove(light);
        });

        // Clear arrays
        this.panels = [];
        this.objects = [];
        this.lights = [];
        this.beams = [];
        this.impactPoints = [];
    }
}

export default DysonSphereTheme;
