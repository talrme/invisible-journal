/**
 * Invisible Journal - Main Application Logic
 * A therapeutic journaling app where text disappears as you write
 */

class InvisibleJournal {
    constructor() {
        // DOM Elements
        this.input = document.getElementById('journal-input');
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textDisplay = document.getElementById('text-display');
        this.textDisplayCursor = document.getElementById('text-display-cursor');
        this.writingArea = document.getElementById('writing-area');
        this.layoutModeSelect = document.getElementById('layout-mode');
        this.effectSelect = document.getElementById('effect-select');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedLabel = document.getElementById('speed-label');
        this.themeToggle = document.getElementById('theme-toggle');
        this.bgSelect = document.getElementById('bg-select');
        this.fontSelect = document.getElementById('font-select');
        
        // Modal elements
        this.settingsBtn = document.getElementById('settings-btn');
        this.infoBtn = document.getElementById('info-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.infoModal = document.getElementById('info-modal');
        this.closeBtns = document.querySelectorAll('.close-btn');

        // State
        this.layoutMode = 'single'; // 'single' or 'multiline'
        this.visualEffect = 'gravity';
        this.speed = 0.5; // 0.5 (slowest) to 10 (fastest)
        this.isDark = false;
        this.particles = [];
        this.deletionTimeout = null;
        this.animationFrame = null;
        this.currentText = '';
        this.isTyping = false;
        this.lastTypingTime = 0;
        this.lastDeletionTime = 0; // Track when we last deleted a character
        this.maxLineChars = 80; // Approximate max characters for one line
        
        // Multiline mode state
        this.words = [];
        this.currentWord = '';
        this.maxLines = 3;
        this.charsPerLine = 50;
        this.totalChars = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.startAnimationLoop();
        this.startDeletionLoop();
        this.preventStorage();
    }

    setupCanvas() {
        // Make canvas larger than the input to show particles flying around
        const rect = this.input.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400; // Fixed height for particles to fly around

        window.addEventListener('resize', () => {
            const rect = this.input.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = 400;
        });
    }

    setupEventListeners() {
        // Layout mode selection
        this.layoutModeSelect.addEventListener('change', (e) => {
            this.layoutMode = e.target.value;
            this.switchLayoutMode();
        });

        // Visual effect selection
        this.effectSelect.addEventListener('change', (e) => {
            this.visualEffect = e.target.value;
        });

        // Speed control
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            this.updateSpeedLabel();
        });
        
        // Show label on interaction, hide after delay
        this.speedSlider.addEventListener('mousedown', () => {
            this.updateSpeedLabel();
        });
        
        this.speedSlider.addEventListener('touchstart', () => {
            this.updateSpeedLabel();
        });
        
        this.speedSlider.addEventListener('mouseup', () => {
            setTimeout(() => {
                this.speedLabel.textContent = '';
            }, 2000);
        });
        
        this.speedSlider.addEventListener('touchend', () => {
            setTimeout(() => {
                this.speedLabel.textContent = '';
            }, 2000);
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.isDark = !this.isDark;
            document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
            const icon = this.themeToggle.querySelector('.toggle-icon');
            const text = this.themeToggle.childNodes[2];
            if (this.isDark) {
                icon.textContent = '☀️';
                text.textContent = ' Light Mode';
            } else {
                icon.textContent = '🌙';
                text.textContent = ' Dark Mode';
            }
        });

        // Background selection
        this.bgSelect.addEventListener('change', (e) => {
            document.body.setAttribute('data-background', e.target.value);
        });

        // Font selection
        this.fontSelect.addEventListener('change', (e) => {
            this.input.setAttribute('data-font', e.target.value);
            this.textDisplay.setAttribute('data-font', e.target.value);
        });

        // Text input - different handling based on mode
        this.input.addEventListener('input', () => {
            if (this.layoutMode === 'single') {
                this.handleTextInput();
            }
        });

        this.input.addEventListener('keydown', (e) => {
            this.isTyping = true;
            this.lastTypingTime = Date.now();
            
            if (this.layoutMode === 'multiline') {
                this.handleMultilineKeydown(e);
            }
        });
        
        // Modal controls
        this.settingsBtn.addEventListener('click', () => {
            this.openModal('settings');
        });
        
        this.infoBtn.addEventListener('click', () => {
            this.openModal('info');
        });
        
        this.closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalName = e.target.getAttribute('data-modal');
                this.closeModal(modalName);
            });
        });
        
        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeModal('settings');
            }
        });
        
        this.infoModal.addEventListener('click', (e) => {
            if (e.target === this.infoModal) {
                this.closeModal('info');
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal('settings');
                this.closeModal('info');
            }
        });
    }
    
    openModal(modalName) {
        if (modalName === 'settings') {
            this.settingsModal.classList.add('active');
        } else if (modalName === 'info') {
            this.infoModal.classList.add('active');
        }
    }
    
    closeModal(modalName) {
        if (modalName === 'settings') {
            this.settingsModal.classList.remove('active');
        } else if (modalName === 'info') {
            this.infoModal.classList.remove('active');
        }
    }

    handleTextInput() {
        this.currentText = this.input.value;
        this.updateDisplay();
        this.lastTypingTime = Date.now();
    }

    // ==================== Layout Mode Switching ====================
    switchLayoutMode() {
        // Clear current content
        this.input.value = '';
        this.currentText = '';
        this.textDisplay.innerHTML = '';
        this.particles = [];
        this.words = [];
        this.currentWord = '';
        this.totalChars = 0;
        this.lastDeletionTime = 0;
        
        if (this.layoutMode === 'multiline') {
            this.writingArea.classList.add('multiline-mode');
            this.input.placeholder = 'Start typing... words will fade in place...';
        } else {
            this.writingArea.classList.remove('multiline-mode');
            this.input.placeholder = 'Start writing... your words will slowly disappear...';
        }
    }

    // ==================== Multiline Mode Handlers ====================
    handleMultilineKeydown(e) {
        e.preventDefault();
        
        if (e.key === ' ') {
            if (this.currentWord) {
                this.addWord(this.currentWord + ' ');
                this.currentWord = '';
                this.updateMultilineCurrentWord();
            }
        } else if (e.key === 'Enter') {
            if (this.currentWord) {
                this.addWord(this.currentWord + ' ');
                this.currentWord = '';
                this.updateMultilineCurrentWord();
            }
        } else if (e.key === 'Backspace') {
            if (this.currentWord.length > 0) {
                this.currentWord = this.currentWord.slice(0, -1);
            } else if (this.words.length > 0) {
                const lastWord = this.words[this.words.length - 1];
                if (lastWord.fadeTimeout) {
                    clearTimeout(lastWord.fadeTimeout);
                }
                this.totalChars -= lastWord.text.length;
                lastWord.element.remove();
                this.words.pop();
            }
            this.updateMultilineCurrentWord();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            this.currentWord += e.key;
            this.updateMultilineCurrentWord();
        }
        
        this.updateMultilineCursor();
    }

    addWord(text) {
        if (text.trim().length === 0) return;
        
        const oldCurrent = this.textDisplay.querySelector('.multiline-current');
        if (oldCurrent) oldCurrent.remove();
        
        const totalWithNew = this.totalChars + text.length;
        const totalLines = Math.ceil(totalWithNew / this.charsPerLine);
        
        if (totalLines > this.maxLines) {
            while (this.words.length > 0 && totalLines > this.maxLines) {
                const oldWord = this.words.shift();
                if (oldWord.fadeTimeout) {
                    clearTimeout(oldWord.fadeTimeout);
                }
                this.totalChars -= oldWord.text.length;
                oldWord.element.remove();
                
                const newTotal = this.totalChars + text.length;
                const newLines = Math.ceil(newTotal / this.charsPerLine);
                if (newLines <= this.maxLines) break;
            }
        }
        
        const wordSpan = document.createElement('span');
        wordSpan.className = 'multiline-word';
        wordSpan.textContent = text;
        this.textDisplay.appendChild(wordSpan);
        
        const wordObj = {
            text: text,
            element: wordSpan,
            fadeTimeout: null
        };
        
        this.words.push(wordObj);
        this.totalChars += text.length;
        
        const fadeSpeed = this.getDeleteSpeed() * 2;
        wordObj.fadeTimeout = setTimeout(() => {
            wordSpan.style.transition = `opacity ${fadeSpeed/1000}s ease`;
            wordSpan.style.opacity = '0';
        }, fadeSpeed);
    }

    updateMultilineCurrentWord() {
        const oldCurrent = this.textDisplay.querySelector('.multiline-current');
        if (oldCurrent) oldCurrent.remove();
        
        if (this.currentWord) {
            const span = document.createElement('span');
            span.className = 'multiline-current';
            span.textContent = this.currentWord;
            this.textDisplay.appendChild(span);
        }
    }

    updateMultilineCursor() {
        // Get the actual end of content
        let lastElement = this.textDisplay.lastElementChild;
        
        if (!lastElement) {
            // No content, position at start
            this.textDisplayCursor.style.left = '30px';
            this.textDisplayCursor.style.top = '30px';
            return;
        }
        
        // Create a temporary measuring span at the end
        const measureSpan = document.createElement('span');
        measureSpan.textContent = '\u200B'; // Zero-width space
        measureSpan.style.display = 'inline';
        this.textDisplay.appendChild(measureSpan);
        
        const rect = measureSpan.getBoundingClientRect();
        const containerRect = this.writingArea.getBoundingClientRect();
        
        this.textDisplayCursor.style.left = `${rect.left - containerRect.left}px`;
        this.textDisplayCursor.style.top = `${rect.top - containerRect.top + 2}px`;
        
        measureSpan.remove();
    }

    updateDisplay() {
        const chars = this.currentText.split('');
        
        // Clear display
        this.textDisplay.innerHTML = '';
        
        // Add each character without gradient
        chars.forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            
            // Preserve spaces by using non-breaking space for display
            span.textContent = char === ' ' ? '\u00A0' : char;
            
            this.textDisplay.appendChild(span);
        });
    }

    // ==================== Speed Calculation ====================
    updateSpeedLabel() {
        // Calculate chars per second (1 / seconds per char)
        const secondsPerChar = this.getDeleteSpeed() / 1000;
        const charsPerSec = 1 / secondsPerChar;
        
        this.speedLabel.textContent = `${charsPerSec.toFixed(1)} char/s`;
    }
    
    getDeleteSpeed() {
        // Map speed slider (0.5 to 10) to deletion time in milliseconds
        // 0.5 = 1000ms (1 second per character = 1 char/sec)
        // 10 = 200ms (0.2 seconds per character = 5 char/sec)
        const minSpeed = 200;   // 5 char/sec at speed=10
        const maxSpeed = 1000;  // 1 char/sec at speed=0.5
        
        // Linear mapping
        const normalized = (this.speed - 0.5) / 9.5; // 0 to 1
        
        return maxSpeed - (normalized * (maxSpeed - minSpeed));
    }

    // ==================== Deletion System ====================
    startDeletionLoop() {
        const checkAndDelete = () => {
            // Only run deletion for single line mode
            if (this.layoutMode === 'single') {
                const now = Date.now();
                const timeSinceTyping = now - this.lastTypingTime;
                const timeSinceLastDeletion = now - this.lastDeletionTime;
                
                const activelyTyping = timeSinceTyping < 500;
                const isFull = this.currentText.length >= this.maxLineChars;
                
                let shouldDelete = false;
                
                // Calculate deletion speed based on continuous slider value
                const normalSpeed = this.getDeleteSpeed();
                
                if (isFull && activelyTyping) {
                    // Line is full and typing - delete fast to keep up
                    shouldDelete = true;
                } else if (timeSinceLastDeletion >= normalSpeed) {
                    // Enough time has passed since last deletion
                    shouldDelete = true;
                }
                
                if (shouldDelete && this.currentText.length > 0) {
                    this.deleteFirstCharacter();
                    this.lastDeletionTime = now;
                }
            }
            
            // Check every 50ms, but only delete based on speed setting
            this.deletionTimeout = setTimeout(checkAndDelete, 50);
        };
        
        checkAndDelete();
    }

    deleteFirstCharacter() {
        if (this.currentText.length === 0) return;
        
        const charToDelete = this.currentText[0];
        const position = this.getCharPosition(0);
        
        // Create visual effect with standard color
        this.createVisualEffect(charToDelete, position.x, position.y);
        
        // Delete the character
        this.input.value = this.currentText.substring(1);
        this.currentText = this.input.value;
        this.updateDisplay();
    }

    getCharPosition(charIndex) {
        const spans = this.textDisplay.querySelectorAll('.char');
        if (spans[charIndex]) {
            const rect = spans[charIndex].getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            return {
                x: rect.left - canvasRect.left + rect.width / 2,
                y: rect.top - canvasRect.top + rect.height / 2
            };
        }
        
        return { 
            x: 50, 
            y: 40
        };
    }

    // ==================== Visual Effects ====================
    createVisualEffect(char, x, y) {
        // Get the standard text color
        const color = getComputedStyle(this.textDisplay).color;
        
        // Always create effects, even for spaces (but with a different visual)
        if (char.trim().length === 0) {
            // For spaces, create a small dot effect
            this.particles.push({
                x, y,
                char: '·',
                vx: (Math.random() - 0.5) * 2,
                vy: -2,
                alpha: 0.5,
                size: 8,
                decay: 0.02,
                gravity: 0.1,
                rotation: 0,
                rotationSpeed: 0,
                type: 'dissolve',
                color: color
            });
            return;
        }
        
        switch(this.visualEffect) {
            case 'explode':
                this.createExplodeEffect(char, x, y, color);
                break;
            case 'float':
                this.createFloatEffect(char, x, y, color);
                break;
            case 'spiral':
                this.createSpiralEffect(char, x, y, color);
                break;
            case 'dissolve':
                this.createDissolveEffect(char, x, y, color);
                break;
            case 'wave':
                this.createWaveEffect(char, x, y, color);
                break;
            case 'vortex':
                this.createVortexEffect(char, x, y, color);
                break;
            case 'gravity':
                this.createGravityEffect(char, x, y, color);
                break;
            case 'firework':
                this.createFireworkEffect(char, x, y, color);
                break;
            case 'scatter':
                this.createScatterEffect(char, x, y, color);
                break;
            case 'typewriter':
                this.createTypewriterEffect(char, x, y, color);
                break;
        }
    }

    createExplodeEffect(char, x, y, color) {
        const count = 8;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 4 + Math.random() * 2;
            this.particles.push({
                x, y, char,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                size: 16,
                decay: 0.015,
                gravity: 0.2,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                type: 'explode',
                color: color
            });
        }
    }

    createFloatEffect(char, x, y, color) {
        this.particles.push({
            x, y, char,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -3,
            alpha: 1,
            size: 18,
            decay: 0.01,
            gravity: 0.05,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
            type: 'float',
            color: color
        });
    }

    createSpiralEffect(char, x, y, color) {
        this.particles.push({
            x, y, char,
            angle: Math.random() * Math.PI * 2,
            radius: 0,
            radiusSpeed: 2.5,
            angleSpeed: 0.15,
            alpha: 1,
            size: 18,
            decay: 0.012,
            rotation: 0,
            rotationSpeed: 0.2,
            type: 'spiral',
            color: color
        });
    }

    createDissolveEffect(char, x, y, color) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                char: '•',
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                size: 8 + Math.random() * 6,
                decay: 0.02,
                gravity: 0.05,
                rotation: 0,
                rotationSpeed: 0,
                type: 'dissolve',
                color: color
            });
        }
    }

    createWaveEffect(char, x, y, color) {
        this.particles.push({
            x, y, char,
            vx: 3,
            vy: 0,
            alpha: 1,
            size: 18,
            decay: 0.012,
            time: 0,
            waveAmplitude: 30,
            waveFrequency: 0.15,
            rotation: 0,
            rotationSpeed: 0.1,
            type: 'wave',
            color: color
        });
    }

    createVortexEffect(char, x, y, color) {
        this.particles.push({
            x, y, char,
            angle: Math.random() * Math.PI * 2,
            radius: 0,
            radiusSpeed: -1.5,
            radiusAccel: 0.15,
            angleSpeed: 0.3,
            alpha: 1,
            size: 18,
            decay: 0.015,
            rotation: 0,
            rotationSpeed: 0.4,
            phase: 'contract',
            type: 'vortex',
            color: color
        });
    }

    createGravityEffect(char, x, y, color) {
        this.particles.push({
            x, y, char,
            vx: (Math.random() - 0.5) * 2,
            vy: 0,
            alpha: 1,
            size: 18,
            decay: 0.008,
            gravity: 0.5,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            bounce: 0.6,
            type: 'gravity',
            color: color
        });
    }

    createFireworkEffect(char, x, y, color) {
        this.particles.push({
            x, y, char,
            vx: (Math.random() - 0.5) * 2,
            vy: -8,
            alpha: 1,
            size: 18,
            decay: 0.01,
            gravity: 0.15,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            exploded: false,
            type: 'firework',
            color: color
        });
    }

    createScatterEffect(char, x, y, color) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        this.particles.push({
            x, y, char,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            alpha: 1,
            size: 18,
            decay: 0.013,
            gravity: 0.25,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.4,
            type: 'scatter',
            color: color
        });
    }

    createTypewriterEffect(char, x, y, color) {
        this.particles.push({
            x, y, char,
            vx: 0,
            vy: 0,
            alpha: 1,
            size: 18,
            decay: 0.03,
            rotation: 0,
            rotationSpeed: 0,
            scale: 1,
            scaleSpeed: -0.02,
            type: 'typewriter',
            color: color
        });
    }

    updateParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles = this.particles.filter(p => {
            // Update based on type
            switch(p.type) {
                case 'explode':
                case 'float':
                case 'dissolve':
                case 'scatter':
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.rotation += p.rotationSpeed;
                    break;

                case 'spiral':
                    p.angle += p.angleSpeed;
                    p.radius += p.radiusSpeed;
                    p.rotation += p.rotationSpeed;
                    break;

                case 'wave':
                    p.time += 0.1;
                    p.x += p.vx;
                    p.y = p.y + Math.sin(p.time * p.waveFrequency) * 2;
                    p.rotation += p.rotationSpeed;
                    break;

                case 'vortex':
                    if (p.phase === 'contract' && p.radius < -50) {
                        p.phase = 'expand';
                        p.radiusSpeed = 3;
                    }
                    p.angle += p.angleSpeed;
                    p.radius += p.radiusSpeed;
                    p.radiusSpeed += p.radiusAccel;
                    p.rotation += p.rotationSpeed;
                    break;

                case 'gravity':
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.rotation += p.rotationSpeed;
                    if (p.y > this.canvas.height - 20) {
                        p.vy *= -p.bounce;
                        p.y = this.canvas.height - 20;
                    }
                    break;

                case 'firework':
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += p.gravity;
                    p.rotation += p.rotationSpeed;
                    if (!p.exploded && p.vy > 0) {
                        p.exploded = true;
                        for (let i = 0; i < 6; i++) {
                            const angle = (Math.PI * 2 * i) / 6;
                            this.particles.push({
                                x: p.x,
                                y: p.y,
                                char: '✦',
                                vx: Math.cos(angle) * 3,
                                vy: Math.sin(angle) * 3,
                                alpha: p.alpha,
                                size: 10,
                                decay: 0.02,
                                gravity: 0.1,
                                rotation: 0,
                                rotationSpeed: 0.2,
                                type: 'dissolve',
                                color: p.color
                            });
                        }
                    }
                    break;

                case 'typewriter':
                    if (p.scale !== undefined) {
                        p.scale += p.scaleSpeed;
                        if (p.scale < 0) p.scale = 0;
                    }
                    break;
            }

            // Update alpha
            p.alpha -= p.decay;
            if (p.alpha < 0) p.alpha = 0;

            // Draw particle
            if (p.alpha > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;

                let drawX = p.x;
                let drawY = p.y;
                if (p.type === 'spiral' || p.type === 'vortex') {
                    drawX = p.x + Math.cos(p.angle) * p.radius;
                    drawY = p.y + Math.sin(p.angle) * p.radius;
                }

                this.ctx.translate(drawX, drawY);
                this.ctx.rotate(p.rotation);

                const scale = p.scale !== undefined ? p.scale : 1;
                this.ctx.scale(scale, scale);

                this.ctx.font = `${p.size}px ${getComputedStyle(this.input).fontFamily}`;
                this.ctx.fillStyle = p.color || getComputedStyle(this.textDisplay).color;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(p.char, 0, 0);

                this.ctx.restore();
                return true;
            }
            return false;
        });
    }

    // ==================== Delete All Effect (Removed) ====================
    // Removed deleteAllWithEffect method

    // ==================== Animation Loop ====================
    startAnimationLoop() {
        const loop = () => {
            this.updateParticles();
            this.animationFrame = requestAnimationFrame(loop);
        };
        loop();
    }

    // ==================== Utility Methods ====================
    preventStorage() {
        this.input.setAttribute('autocomplete', 'off');
        
        window.addEventListener('beforeunload', () => {
            this.input.value = '';
        });

        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                this.input.value = '';
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InvisibleJournal();
});
