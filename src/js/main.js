import AudioVisualizer from './AudioVisualizer.js';

window.addEventListener('DOMContentLoaded', () => {
    try {
        const visualizer = new AudioVisualizer();
        console.log('AudioVisualizer initialized successfully');
    } catch (error) {
        console.error('Failed to initialize AudioVisualizer:', error);
        document.getElementById('loading').textContent = 'Error: Failed to initialize';
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
        }
    }
});
