// Mode switching
const modeBtns = document.querySelectorAll('.mode-btn');
const modeContainers = document.querySelectorAll('.mode-container');

modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        
        // Update active button
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active container
        modeContainers.forEach(c => c.classList.remove('active'));
        document.getElementById(`mode${mode}`).classList.add('active');
        
        // Initialize the mode
        if (mode === '1') mode1.init();
        if (mode === '2') mode2.init();
        if (mode === '3') mode3.init();
    });
});

// ==================== MODE 1: Pull & Delete ====================
const mode1 = {
    input: document.getElementById('mode1-input'),
    canvas: document.getElementById('mode1-canvas'),
    display: document.getElementById('mode1-display'),
    effectSelect: document.getElementById('mode1-effect'),
    ctx: null,
    particles: [],
    currentText: '',
    effect: 'gravity',
    deletionInterval: null,
    animationFrame: null,
    
    init() {
        this.ctx = this.canvas.getContext('2d');
        const rect = this.input.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400;
        
        this.input.value = '';
        this.currentText = '';
        this.particles = [];
        
        this.input.oninput = () => this.handleInput();
        this.effectSelect.onchange = (e) => this.effect = e.target.value;
        
        this.startDeletion();
        this.startAnimation();
    },
    
    handleInput() {
        this.currentText = this.input.value;
        this.updateDisplay();
    },
    
    updateDisplay() {
        const chars = this.currentText.split('');
        this.display.innerHTML = '';
        
        chars.forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            
            if (chars.length > 20 && i < 20) {
                const progress = i / 20;
                const opacity = 0.4 + (progress * 0.6);
                const grayValue = Math.floor(100 + (progress * 155));
                const grayHex = grayValue.toString(16).padStart(2, '0');
                
                span.style.opacity = opacity;
                span.style.color = `#${grayHex}${grayHex}${grayHex}`;
            }
            
            this.display.appendChild(span);
        });
    },
    
    startDeletion() {
        const deleteChar = () => {
            if (this.currentText.length > 80) {
                const char = this.currentText[0];
                const spans = this.display.querySelectorAll('.char');
                
                if (spans[0]) {
                    const rect = spans[0].getBoundingClientRect();
                    const canvasRect = this.canvas.getBoundingClientRect();
                    const x = rect.left - canvasRect.left + rect.width / 2;
                    const y = rect.top - canvasRect.top + rect.height / 2;
                    
                    this.createEffect(char, x, y);
                }
                
                this.input.value = this.currentText.substring(1);
                this.currentText = this.input.value;
                this.updateDisplay();
            }
        };
        
        this.deletionInterval = setInterval(deleteChar, 50);
    },
    
    createEffect(char, x, y) {
        if (char.trim().length === 0) return;
        
        if (this.effect === 'gravity') {
            this.particles.push({
                x, y, char,
                vx: (Math.random() - 0.5) * 2,
                vy: 0,
                alpha: 1,
                gravity: 0.5,
                bounce: 0.6,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                type: 'gravity'
            });
        } else if (this.effect === 'dissolve') {
            for (let i = 0; i < 12; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.5 + Math.random() * 1.5;
                this.particles.push({
                    x: x + (Math.random() - 0.5) * 20,
                    y: y + (Math.random() - 0.5) * 20,
                    char: '•',
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    gravity: 0.05,
                    type: 'dissolve'
                });
            }
        } else if (this.effect === 'float') {
            this.particles.push({
                x, y, char,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -3,
                alpha: 1,
                gravity: 0.05,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                type: 'float'
            });
        }
    },
    
    startAnimation() {
        const loop = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.particles = this.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                
                if (p.rotation !== undefined) {
                    p.rotation += p.rotationSpeed;
                }
                
                if (p.type === 'gravity' && p.y > this.canvas.height - 20) {
                    p.vy *= -p.bounce;
                    p.y = this.canvas.height - 20;
                }
                
                p.alpha -= 0.015;
                
                if (p.alpha > 0) {
                    this.ctx.save();
                    this.ctx.globalAlpha = p.alpha;
                    this.ctx.translate(p.x, p.y);
                    if (p.rotation) this.ctx.rotate(p.rotation);
                    this.ctx.font = '18px Arial';
                    this.ctx.fillStyle = '#1a1a1a';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(p.char, 0, 0);
                    this.ctx.restore();
                    return true;
                }
                return false;
            });
            
            this.animationFrame = requestAnimationFrame(loop);
        };
        loop();
    }
};

// ==================== MODE 2: Fade in Place ====================
const mode2 = {
    container: document.getElementById('mode2-container'),
    display: document.getElementById('mode2-display'),
    cursor: document.getElementById('mode2-cursor'),
    speedSelect: document.getElementById('mode2-speed'),
    words: [],
    currentWord: '',
    fadeSpeed: 2000,
    maxLines: 3,
    charsPerLine: 50, // approximate
    totalChars: 0,
    
    init() {
        this.display.innerHTML = '';
        this.words = [];
        this.currentWord = '';
        this.totalChars = 0;
        
        this.speedSelect.onchange = (e) => {
            this.fadeSpeed = parseInt(e.target.value);
        };
        
        // Listen for keyboard input on the container
        this.container.tabIndex = 0;
        this.container.focus();
        
        this.container.onkeydown = (e) => {
            e.preventDefault();
            
            if (e.key === ' ') {
                if (this.currentWord) {
                    this.addWord(this.currentWord + ' ');
                    this.currentWord = '';
                    this.updateCurrentWord(); // Clear current word display first
                }
            } else if (e.key === 'Enter') {
                if (this.currentWord) {
                    this.addWord(this.currentWord + ' ');
                    this.currentWord = '';
                    this.updateCurrentWord(); // Clear current word display first
                }
            } else if (e.key === 'Backspace') {
                if (this.currentWord.length > 0) {
                    this.currentWord = this.currentWord.slice(0, -1);
                } else if (this.words.length > 0) {
                    // Remove last word
                    const lastWord = this.words[this.words.length - 1];
                    this.totalChars -= lastWord.text.length;
                    lastWord.element.remove();
                    this.words.pop();
                }
                this.updateCurrentWord();
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                this.currentWord += e.key;
                this.updateCurrentWord();
            }
            
            this.updateCursor();
        };
        
        this.updateCursor();
    },
    
    addWord(text) {
        if (text.trim().length === 0) return;
        
        // Remove current word display before adding permanent word
        const oldCurrent = this.display.querySelector('.mode2-current');
        if (oldCurrent) oldCurrent.remove();
        
        // Check if we need to wrap to top (exceeded 3 lines)
        const totalWithNew = this.totalChars + text.length;
        const totalLines = Math.ceil(totalWithNew / this.charsPerLine);
        
        if (totalLines > this.maxLines) {
            // Remove old words from the beginning until we have room
            while (this.words.length > 0 && totalLines > this.maxLines) {
                const oldWord = this.words.shift();
                this.totalChars -= oldWord.text.length;
                oldWord.element.remove();
                
                const newTotal = this.totalChars + text.length;
                const newLines = Math.ceil(newTotal / this.charsPerLine);
                if (newLines <= this.maxLines) break;
            }
        }
        
        const wordSpan = document.createElement('span');
        wordSpan.className = 'mode2-word';
        wordSpan.textContent = text;
        this.display.appendChild(wordSpan);
        
        const wordObj = {
            text: text,
            element: wordSpan,
            fadeTimeout: null
        };
        
        this.words.push(wordObj);
        this.totalChars += text.length;
        
        // Start fading after a delay
        wordObj.fadeTimeout = setTimeout(() => {
            wordSpan.classList.add('fading');
        }, this.fadeSpeed);
    },
    
    updateCurrentWord() {
        // Remove old current word display
        const oldCurrent = this.display.querySelector('.mode2-current');
        if (oldCurrent) oldCurrent.remove();
        
        if (this.currentWord) {
            const span = document.createElement('span');
            span.className = 'mode2-current';
            span.textContent = this.currentWord;
            this.display.appendChild(span);
        }
    },
    
    updateCursor() {
        // Create a temporary span to measure the actual position
        const measureSpan = document.createElement('span');
        measureSpan.style.visibility = 'hidden';
        measureSpan.textContent = '|'; // Single character to get position
        this.display.appendChild(measureSpan);
        
        const rect = measureSpan.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        
        this.cursor.style.left = `${rect.left - containerRect.left}px`;
        this.cursor.style.top = `${rect.top - containerRect.top}px`;
        
        measureSpan.remove();
    }
};


// ==================== MODE 3: Burn Away ====================
const mode3 = {
    input: document.getElementById('mode3-input'),
    canvas: document.getElementById('mode3-canvas'),
    display: document.getElementById('mode3-display'),
    speedSelect: document.getElementById('mode3-speed'),
    ctx: null,
    particles: [],
    currentText: '',
    speed: 'medium',
    burnInterval: null,
    animationFrame: null,
    
    init() {
        this.ctx = this.canvas.getContext('2d');
        const rect = this.input.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400;
        
        this.input.value = '';
        this.currentText = '';
        this.particles = [];
        
        this.input.oninput = () => this.handleInput();
        this.speedSelect.onchange = (e) => {
            this.speed = e.target.value;
            this.startBurning();
        };
        
        this.startBurning();
        this.startAnimation();
    },
    
    handleInput() {
        this.currentText = this.input.value;
        this.updateDisplay();
    },
    
    updateDisplay() {
        const chars = this.currentText.split('');
        this.display.innerHTML = '';
        
        chars.forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            this.display.appendChild(span);
        });
    },
    
    startBurning() {
        if (this.burnInterval) clearInterval(this.burnInterval);
        
        const speeds = { slow: 500, medium: 200, fast: 80 };
        const interval = speeds[this.speed];
        
        this.burnInterval = setInterval(() => {
            if (this.currentText.length > 20) {
                // Pick a random character from the first half
                const maxIndex = Math.floor(this.currentText.length / 2);
                const randomIndex = Math.floor(Math.random() * maxIndex);
                
                const char = this.currentText[randomIndex];
                const spans = this.display.querySelectorAll('.char');
                
                if (spans[randomIndex]) {
                    const rect = spans[randomIndex].getBoundingClientRect();
                    const canvasRect = this.canvas.getBoundingClientRect();
                    const x = rect.left - canvasRect.left + rect.width / 2;
                    const y = rect.top - canvasRect.top + rect.height / 2;
                    
                    this.createBurnEffect(char, x, y);
                }
                
                // Remove the character
                this.currentText = this.currentText.substring(0, randomIndex) + 
                                  this.currentText.substring(randomIndex + 1);
                this.input.value = this.currentText;
                this.updateDisplay();
            }
        }, interval);
    },
    
    createBurnEffect(char, x, y) {
        if (char.trim().length === 0) return;
        
        // Create burning ember effect
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.3;
            const speed = 1 + Math.random() * 2;
            
            this.particles.push({
                x, y,
                char: ['•', '✦', '◆'][Math.floor(Math.random() * 3)],
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                alpha: 1,
                gravity: 0.1,
                color: ['#ff6b35', '#ff9500', '#ffcc00'][Math.floor(Math.random() * 3)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            });
        }
        
        // Add the original character fading
        this.particles.push({
            x, y, char,
            vx: 0,
            vy: -0.5,
            alpha: 1,
            gravity: 0,
            color: '#666',
            rotation: 0,
            rotationSpeed: 0.05,
            scale: 1,
            scaleSpeed: 0.02
        });
    },
    
    startAnimation() {
        const loop = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.particles = this.particles.filter(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.rotation += p.rotationSpeed;
                
                if (p.scale) p.scale += p.scaleSpeed;
                
                p.alpha -= 0.02;
                
                if (p.alpha > 0) {
                    this.ctx.save();
                    this.ctx.globalAlpha = p.alpha;
                    this.ctx.translate(p.x, p.y);
                    this.ctx.rotate(p.rotation);
                    if (p.scale) this.ctx.scale(p.scale, p.scale);
                    this.ctx.font = '18px Arial';
                    this.ctx.fillStyle = p.color || '#1a1a1a';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(p.char, 0, 0);
                    this.ctx.restore();
                    return true;
                }
                return false;
            });
            
            this.animationFrame = requestAnimationFrame(loop);
        };
        loop();
    }
};

// Initialize the first mode
mode1.init();

