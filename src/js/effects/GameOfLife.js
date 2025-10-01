import * as THREE from 'three';

class GameOfLife {
    constructor(scene) {
        this.scene = scene;
        this.gridSize = 100;
        this.cellSize = 0.8;
        this.grid = [];
        this.nextGrid = [];
        this.lastUpdate = 0;
        this.updateInterval = 200;
        this.visible = true;

        this.updateCount = 0;
        this.cellChanges = 0;
        this.diagnosticInterval = 5000;
        this.lastDiagnostic = 0;

        this.initGrid();
        this.createMesh();

        console.log('[GameOfLife] Initialized: grid=' + this.gridSize + 'x' + this.gridSize + ', cells=' + (this.gridSize * this.gridSize));
    }

    initGrid() {
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            this.nextGrid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = Math.random() < 0.3 ? 1 : 0;
                this.nextGrid[i][j] = 0;
            }
        }
    }

    createMesh() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        this.sphereRadius = 35;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const phi = (i / this.gridSize) * Math.PI;
                const theta = (j / this.gridSize) * Math.PI * 2;

                const x = this.sphereRadius * Math.sin(phi) * Math.cos(theta);
                const y = this.sphereRadius * Math.sin(phi) * Math.sin(theta);
                const z = this.sphereRadius * Math.cos(phi);

                positions.push(x, y, z);
                colors.push(0, 1, 1);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: this.cellSize * 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.mesh = new THREE.Points(geometry, material);
        this.scene.add(this.mesh);

        this.basePositions = positions.slice();
    }

    countNeighbors(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nx = (x + i + this.gridSize) % this.gridSize;
                const ny = (y + j + this.gridSize) % this.gridSize;
                count += this.grid[nx][ny];
            }
        }
        return count;
    }

    updateGrid(audioIntensity) {
        let changes = 0;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const neighbors = this.countNeighbors(i, j);
                const oldState = this.grid[i][j];

                if (this.grid[i][j] === 1) {
                    this.nextGrid[i][j] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                } else {
                    this.nextGrid[i][j] = (neighbors === 3) ? 1 : 0;
                }

                if (audioIntensity > 1 && Math.random() < audioIntensity * 0.01) {
                    this.nextGrid[i][j] = 1;
                }

                if (oldState !== this.nextGrid[i][j]) {
                    changes++;
                }
            }
        }

        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        this.cellChanges = changes;
        this.updateCount++;
    }

    updateMesh() {
        const colors = this.mesh.geometry.attributes.color.array;
        const positions = this.mesh.geometry.attributes.position.array;

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const idx = (i * this.gridSize + j) * 3;

                if (this.grid[i][j] === 1) {
                    colors[idx] = 0;
                    colors[idx + 1] = 1;
                    colors[idx + 2] = 1;

                    const scale = 1 + Math.random() * 0.05;
                    positions[idx] = this.basePositions[idx] * scale;
                    positions[idx + 1] = this.basePositions[idx + 1] * scale;
                    positions[idx + 2] = this.basePositions[idx + 2] * scale;
                } else {
                    colors[idx] = 0;
                    colors[idx + 1] = 0.1;
                    colors[idx + 2] = 0.1;

                    positions[idx] = this.basePositions[idx];
                    positions[idx + 1] = this.basePositions[idx + 1];
                    positions[idx + 2] = this.basePositions[idx + 2];
                }
            }
        }

        this.mesh.geometry.attributes.color.needsUpdate = true;
        this.mesh.geometry.attributes.position.needsUpdate = true;
    }

    update(audioIntensity) {
        if (!this.visible) return;

        const now = performance.now();
        if (now - this.lastUpdate > this.updateInterval) {
            this.updateGrid(audioIntensity);
            this.updateMesh();
            this.lastUpdate = now;

            if (now - this.lastDiagnostic > this.diagnosticInterval) {
                this.runDiagnostics();
                this.lastDiagnostic = now;
            }
        }
    }

    runDiagnostics() {
        let aliveCells = 0;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 1) aliveCells++;
            }
        }

        const totalCells = this.gridSize * this.gridSize;
        const alivePercent = ((aliveCells / totalCells) * 100).toFixed(1);
        const fps = (1000 / this.updateInterval).toFixed(1);

        console.log('[GameOfLife] Status:');
        console.log('  ├─ Updates: ' + this.updateCount);
        console.log('  ├─ Alive cells: ' + aliveCells + '/' + totalCells + ' (' + alivePercent + '%)');
        console.log('  ├─ Last changes: ' + this.cellChanges + ' cells');
        console.log('  ├─ Update rate: ' + fps + ' Hz (' + this.updateInterval + 'ms)');
        console.log('  ├─ Visible: ' + this.visible);
        console.log('  └─ Mesh in scene: ' + (this.mesh.parent !== null));

        if (aliveCells === 0) {
            console.warn('[GameOfLife] WARNING: No alive cells detected! Re-seeding...');
            this.initGrid();
        } else if (this.cellChanges === 0 && this.updateCount > 5) {
            console.warn('[GameOfLife] WARNING: No cell changes detected (static pattern)');
        }
    }

    setVisible(visible) {
        this.visible = visible;
        this.mesh.visible = visible;
        console.log('[GameOfLife] Visibility changed: ' + visible);
    }

    getStatus() {
        let aliveCells = 0;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 1) aliveCells++;
            }
        }

        return {
            updates: this.updateCount,
            aliveCells: aliveCells,
            totalCells: this.gridSize * this.gridSize,
            lastChanges: this.cellChanges,
            visible: this.visible,
            updateInterval: this.updateInterval,
            inScene: this.mesh.parent !== null
        };
    }
}

export default GameOfLife;
