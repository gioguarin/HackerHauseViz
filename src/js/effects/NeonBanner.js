class NeonBanner {
    constructor() {
        this.canvas = document.getElementById('banner-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.defaultText = "HACKERHAUS POST-CONVENTION STORIES: The energy was electric as developers gathered to share tales of brilliant hacks and innovative solutions... ";
        this.text = this.defaultText;
        this.scrollX = 0;
        this.time = 0;
        this.visible = true;

        this.font = {
            A: [[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
            B: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,1,1,0]],
            C: [[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
            D: [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
            E: [[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
            F: [[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
            G: [[0,1,1,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[0,1,1,0]],
            H: [[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
            I: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
            J: [[0,0,1,1],[0,0,0,1],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
            K: [[1,0,0,1],[1,0,1,0],[1,1,0,0],[1,0,1,0],[1,0,0,1]],
            L: [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
            M: [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
            N: [[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1]],
            O: [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
            P: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
            Q: [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,1,0],[0,1,0,1]],
            R: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
            S: [[0,1,1,1],[1,0,0,0],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
            T: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
            U: [[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
            V: [[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,1,0,0]],
            W: [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
            X: [[1,0,0,1],[0,1,1,0],[0,1,0,0],[0,1,1,0],[1,0,0,1]],
            Y: [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
            Z: [[1,1,1,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
            ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
            ':': [[0],[1],[0],[1],[0]],
            '.': [[0],[0],[0],[0],[1]],
            '-': [[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]]
        };

        this.onResize();
    }

    onResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = 60;
    }

    drawChar(char, x, y, pixelSize, color, glow) {
        const pattern = this.font[char.toUpperCase()] || this.font[' '];

        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col]) {
                    const px = x + col * pixelSize;
                    const py = y + row * pixelSize;

                    if (glow > 0) {
                        this.ctx.shadowBlur = 10 + glow * 10;
                        this.ctx.shadowColor = color;
                    }

                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(px, py, pixelSize - 1, pixelSize - 1);
                }
            }
        }

        this.ctx.shadowBlur = 0;
    }

    update(audioIntensity, colorSpeed) {
        if (!this.visible) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        this.time += 0.01 * colorSpeed;
        this.scrollX -= 2;

        const pixelSize = 6;
        const charSpacing = 5;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const hue = (this.time * 0.1) % 1;
        const color = `hsl(${hue * 360}, 100%, ${50 + audioIntensity * 20}%)`;
        const glow = audioIntensity;

        let x = this.scrollX;
        const y = 10;

        for (let i = 0; i < this.text.length; i++) {
            const char = this.text[i];
            const pattern = this.font[char.toUpperCase()] || this.font[' '];
            const charWidth = pattern[0].length * pixelSize;

            if (x + charWidth > 0 && x < this.canvas.width) {
                this.drawChar(char, x, y, pixelSize, color, glow);
            }

            x += charWidth + charSpacing;
        }

        if (this.scrollX + this.text.length * (pixelSize * 5 + charSpacing) < 0) {
            this.scrollX = this.canvas.width;
        }
    }

    setVisible(visible) {
        this.visible = visible;
        if (!visible) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    setText(newText) {
        this.text = newText.toUpperCase() + " ";
        this.scrollX = this.canvas.width;
    }

    resetText() {
        this.text = this.defaultText;
        this.scrollX = this.canvas.width;
    }
}

export default NeonBanner;
