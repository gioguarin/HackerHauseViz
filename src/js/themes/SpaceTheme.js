import * as THREE from 'three';

class SpaceTheme {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.objects = [];
        this.lights = [];
        this.time = 0;

        this.createOrb();
        this.createRings();
        this.createParticles();
        this.createLights();
    }

    createOrb() {
        const geometry = new THREE.SphereGeometry(3, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        this.orb = new THREE.Mesh(geometry, material);
        this.scene.add(this.orb);
        this.objects.push(this.orb);
    }

    createRings() {
        this.rings = [];
        for (let i = 0; i < 5; i++) {
            const radius = 8 + i * 3;
            const geometry = new THREE.TorusGeometry(radius, 0.1, 16, 100);
            const material = new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.3
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.rotation.x = Math.PI / 2 + Math.random() * 0.5;
            ring.rotation.y = Math.random() * Math.PI;
            this.scene.add(ring);
            this.rings.push({ mesh: ring, baseRotX: ring.rotation.x, baseRotY: ring.rotation.y });
            this.objects.push(ring);
        }
    }

    createParticles() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 15 + Math.random() * 10;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            colors[i * 3] = 0;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        this.objects.push(this.particles);

        this.particleBasePositions = positions.slice();
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);

        for (let i = 0; i < 3; i++) {
            const light = new THREE.PointLight(0x00ffff, 1, 100);
            this.scene.add(light);
            this.lights.push(light);
        }
    }

    update(freqData, colorSpeed) {
        this.time += 0.01 * colorSpeed;

        if (this.orb) {
            const scale = 1 + freqData.bass * 0.5;
            this.orb.scale.set(scale, scale, scale);
            this.orb.material.emissiveIntensity = 0.5 + freqData.bass * 0.5;

            const hue = (this.time * 0.1) % 1;
            this.orb.material.color.setHSL(hue, 1, 0.5);
            this.orb.material.emissive.setHSL(hue, 1, 0.5);
        }

        this.rings.forEach((ringData, i) => {
            const scale = 1 + (freqData.mid + freqData.treble) * 0.1;
            ringData.mesh.scale.set(scale, scale, scale);

            ringData.mesh.rotation.x = ringData.baseRotX + Math.sin(this.time * 0.3 + i) * 0.3;
            ringData.mesh.rotation.y = ringData.baseRotY + this.time * 0.1 * (i + 1);
            ringData.mesh.rotation.z += 0.005 * (i + 1) * colorSpeed;

            const hue = ((this.time * 0.1) + i * 0.2) % 1;
            ringData.mesh.material.color.setHSL(hue, 1, 0.5);
            ringData.mesh.material.emissive.setHSL(hue, 1, 0.5);
            ringData.mesh.material.emissiveIntensity = 0.3 + freqData.mid * 0.3;
        });

        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            const colors = this.particles.geometry.attributes.color.array;

            for (let i = 0; i < positions.length / 3; i++) {
                if (i < freqData.array.length && Math.random() < 0.1) {
                    const intensity = freqData.array[i] / 255;
                    const scale = 1 + intensity * 0.5;

                    positions[i * 3] = this.particleBasePositions[i * 3] * scale;
                    positions[i * 3 + 1] = this.particleBasePositions[i * 3 + 1] * scale;
                    positions[i * 3 + 2] = this.particleBasePositions[i * 3 + 2] * scale;

                    const hue = (this.time * 0.1 + i * 0.01) % 1;
                    const color = new THREE.Color().setHSL(hue, 1, 0.5);
                    colors[i * 3] = color.r;
                    colors[i * 3 + 1] = color.g;
                    colors[i * 3 + 2] = color.b;
                }
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            this.particles.geometry.attributes.color.needsUpdate = true;
            this.particles.rotation.y += 0.001 * colorSpeed;
        }

        this.lights.forEach((light, i) => {
            if (i > 0) {
                const angle = this.time + (i * Math.PI * 2 / 3);
                const radius = 20 + freqData.bass * 10;
                light.position.x = Math.cos(angle) * radius;
                light.position.z = Math.sin(angle) * radius;
                light.position.y = Math.sin(this.time * 2) * 10;
                light.intensity = 1 + freqData.treble;

                const hue = (this.time * 0.1 + i * 0.3) % 1;
                light.color.setHSL(hue, 1, 0.5);
            }
        });
    }

    dispose() {
        this.objects.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
            this.scene.remove(obj);
        });

        this.lights.forEach(light => {
            this.scene.remove(light);
        });
    }
}

export default SpaceTheme;
