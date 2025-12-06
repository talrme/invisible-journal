# Invisible Journal - AI/Developer Documentation

## Project Overview

Invisible Journal is a therapeutic web application for ephemeral journaling. Text disappears as users write, creating a judgment-free space for authentic self-expression. Built with vanilla JavaScript, no frameworks or dependencies.

**Core Philosophy**: Privacy-first, ephemeral, therapeutic, visually engaging.

---

## Architecture

### Technology Stack
- **HTML5**: Semantic structure, PWA meta tags
- **CSS3**: Custom properties (CSS variables), animations, responsive design
- **Vanilla JavaScript**: Class-based architecture, Canvas API for effects
- **Canvas API**: Particle system for visual effects
- **PWA**: Progressive Web App with manifest.json

### File Structure

```
invisible-journal/
├── index.html          # Application structure, modals, input
├── styles.css          # Theming, responsive design, animations
├── app.js              # Core logic (InvisibleJournal class)
├── manifest.json       # PWA configuration for home screen installation
├── feelings_wheel.png  # Reference tool for emotional awareness
└── README.md           # User-facing documentation
```

---

## Core Components

### 1. InvisibleJournal Class (`app.js`)

Main application controller that manages all functionality.

#### Key Properties

```javascript
// Layout modes
this.layoutMode = 'single' | 'multiline'

// Visual effects
this.visualEffect = 'gravity' | 'dissolve' | 'explode' | 'spiral' | 'scatter'

// Settings
this.speed = 0-5 (chars/sec deletion speed)
this.currentTheme = 'light-blue' | 'dark' | 'warm' | 'dark-warm' | 'forest' | 'dark-forest' | 'lavender' | 'dark-lavender' | 'minimal' | 'dark-minimal'
this.currentFont = 'serif' | 'sans' | 'mono' | 'handwriting'

// State tracking
this.currentText = string (current input value)
this.particles = array (active particle objects)
this.lastDeletionTime = timestamp
this.firstCharTime = timestamp
this.maxLineChars = number (dynamic based on screen width)
```

#### Core Methods

**Initialization:**
- `init()` - Setup canvas, load URL settings, start loops
- `setupCanvas()` - Configure canvas dimensions (responsive)
- `setupEventListeners()` - Bind all UI interactions
- `updateMaxLineChars()` - Calculate character limit based on font/width

**Text Management:**
- `handleTextInput()` - Process input changes, manage deletion timing
- `updateDisplay()` - Sync visible text with internal state
- `deleteFirstCharacter()` - Remove first char and trigger effect

**Particle Effects:**
- `createVisualEffect()` - Dispatch to specific effect creator
- `createGravityEffect()` - Characters fall with gravity/bounce
- `createExplodeEffect()` - Burst outward in all directions
- `createDissolveEffect()` - Break into small particles
- `createSpiralEffect()` - Spiral outward pattern
- `createScatterEffect()` - Random chaotic movement
- `updateParticles()` - Animation loop, update positions/draw

**URL Management:**
- `loadSettingsFromURL()` - Parse query params, apply settings
- `updateURL()` - Encode current settings to URL
- Settings persist across reloads and are shareable

**Modal System:**
- `openModal(name)` - Show settings/feelings/info modals
- `closeModal(name)` - Hide modals
- `setRandomPlaceholder()` - Select random placeholder phrase

#### Deletion Logic

**Smart Speed System:**
1. **Normal typing**: Uses slider value (0-5 chars/sec)
2. **Line is full + typing**: Automatically speeds to 5 chars/sec to keep up
3. **Speed = 0**: Characters never delete (manual mode)
4. **First character delay**: 200ms grace period before deletion starts

**Implementation:**
```javascript
// Convert chars/sec to ms per character
getDeleteSpeed() {
  if (this.speed === 0) return 999999; // Never delete
  return 1000 / this.speed; // e.g., 1 char/sec = 1000ms
}

// Deletion loop runs every 50ms but only deletes based on speed
startDeletionLoop() {
  // Check if enough time has passed since last deletion
  // If line is full and typing, delete immediately
}
```

---

## Visual Effects System

### Particle Object Structure

Each particle has:
```javascript
{
  char: string,           // Character to display
  x, y: numbers,          // Current position
  vx, vy: numbers,        // Velocity
  alpha: 0-1,             // Opacity
  size: number,           // Font size
  decay: number,          // Alpha reduction per frame
  rotation: number,       // Current rotation angle
  rotationSpeed: number,  // Rotation velocity
  type: string,           // Effect type
  color: object,          // RGB color values
  // Effect-specific properties...
}
```

### Effect Implementations

**1. Gravity (Drop)** 🪐
- Falls downward with gravity
- Bounces at bottom of canvas
- Slight horizontal variance

**2. Dissolve** ✨
- Breaks into 12 small dots
- Dots move in random directions
- Creates shimmering effect

**3. Explode** 💥
- 8 copies burst outward radially
- Even spacing (360°/8 = 45° apart)
- Fast initial velocity

**4. Spiral** 🌀
- Rotates outward in spiral pattern
- Radius increases over time
- Smooth circular motion

**5. Scatter** 🎲
- Random angle and speed for each character
- Gravity pulls down
- Chaotic, unpredictable movement

### Animation Loop

```javascript
startAnimationLoop() {
  const loop = () => {
    this.updateParticles();
    this.animationFrame = requestAnimationFrame(loop);
  };
  loop();
}

updateParticles() {
  // 1. Clear canvas
  // 2. Update each particle's position/properties
  // 3. Draw particle at new position
  // 4. Remove dead particles (alpha <= 0 or off-screen)
}
```

---

## Theming System

### CSS Architecture

**10 Complete Themes** using CSS custom properties:

```css
body[data-theme="theme-name"] {
  --bg-primary: color;     /* Gradient start */
  --bg-secondary: color;   /* Gradient end */
  --text-primary: color;   /* Main text */
  --text-secondary: color; /* Secondary text */
  --control-bg: color;     /* Input/button backgrounds */
  --control-border: color; /* Borders */
  --shadow: color;         /* Shadows */
  --accent: color;         /* Highlights */
  --delete-btn: color;     /* Destructive actions */
}
```

**Theme Categories:**
- Light themes: Light Blue, Warm, Forest, Lavender, Minimal
- Dark themes: Dark, Dark Warm, Dark Forest, Dark Lavender, Dark Minimal

Each theme provides complete visual consistency across all UI elements.

---

## Modal System

### Structure

Three modals:
1. **Settings Modal**: All customization options
2. **Feelings Wheel Modal**: Emotional reference tool
3. ~~**Info Modal**~~: Removed (privacy note moved to settings)

### Implementation

```javascript
openModal(name) {
  this.{name}Modal.classList.add('active');
}

closeModal(name) {
  this.{name}Modal.classList.remove('active');
}
```

**Close triggers:**
- Click X button
- Click outside modal
- Press Escape key

**CSS Transitions:**
- Fade-in backdrop with blur
- Modal content scales/fades in
- Smooth 300ms animations

---

## Settings UI Design

### Button-Based Controls (No Dropdowns)

**Disappearing Effect Buttons:**
- 5 icon buttons in grid
- Shows emoji icon with text label on hover/active
- Fixed height prevents layout shift

**Theme Swatches:**
- 10 buttons showing gradient previews
- Grid layout (auto-fit)
- Active state with accent border

**Font Buttons:**
- 4 buttons in 2x2 grid
- Each button displays text in its font
- Active state highlighting

**Layout Buttons:**
- 2 buttons in Advanced section
- Shows icon + label + description
- Collapsible section

### Advanced Section

Collapsible section with:
- Rotating arrow indicator (▶ → ▼)
- Smooth height transition
- Contains less frequently used options

---

## Responsive Design

### Breakpoint: 768px

**Mobile Adjustments:**
```css
@media (max-width: 768px) {
  /* Shorter writing area (70px vs 80px) */
  /* Smaller margins for keyboard space */
  /* Shorter particle canvas (200px vs 400px) */
  /* Effect buttons: 3 columns instead of 5 */
  /* Smaller font sizes and padding */
  /* Modal adjustments for screen size */
}
```

**iOS Safari Fixes:**
- `-webkit-fill-available` for proper viewport height
- `touch-action: manipulation` to prevent zoom
- Fixed positioning considerations for keyboard

---

## URL Parameter System

### Encoding

All settings are encoded in URL query parameters:
- `?layout=single|multiline`
- `&effect=gravity|dissolve|explode|spiral|scatter`
- `&speed=0-5` (decimal values like 1.2)
- `&theme=light-blue|dark|warm|...`
- `&font=serif|sans|mono|handwriting`

**Default values are NOT included** in URL to keep it clean.

### Usage
- Settings persist across page reloads
- Users can bookmark specific configurations
- Share URLs with preferred settings
- Clicking title resets to defaults (goes to `?`)

---

## Placeholder Phrases

### Current Phrases (14 total)

1. "What's on your mind right now..."
2. "Watch your worries fade away..."
3. "Write it down, then let it disappear..."
4. "Free your mind, no trace left behind..."
5. "Express, release, move forward..."
6. "Start typing, watch it disappear..."
7. "Just you and this moment..."
8. "Type and let go..."
9. "Speak freely into the void..."
10. "Let your mind empty here..."
11. "Lighten your mind, one word at a time..."
12. "Let go of what you're carrying..."
13. "Start writing. Your words will disappear..."
14. "Say it here, leave it here..."

### Behavior
- Random phrase selected on page load
- New random phrase appears when all text is deleted
- Repeats allowed (truly random each time)
- Automatically disappears when user starts typing

---

## Character Limit Calculation

Dynamic calculation based on screen size and font:

```javascript
updateMaxLineChars() {
  const containerWidth = this.input.offsetWidth;
  const fontSize = parseFloat(getComputedStyle(this.textDisplay).fontSize);
  const estimatedCharWidth = fontSize * 0.6; // Rough estimate
  this.maxLineChars = Math.floor(containerWidth / estimatedCharWidth);
}
```

Recalculates on window resize for responsiveness.

---

## Privacy Implementation

### Active Prevention Measures

```javascript
preventStorage() {
  // Clear any accidental storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Prevent form autocomplete
  this.input.setAttribute('autocomplete', 'off');
  
  // Clear on page unload
  window.addEventListener('beforeunload', () => {
    this.input.value = '';
    this.currentText = '';
  });
}
```

### What's NOT Stored
- ❌ No localStorage
- ❌ No sessionStorage
- ❌ No cookies
- ❌ No server requests
- ❌ No analytics
- ❌ No tracking

**Only URL parameters** are used (for settings, not content).

---

## PWA Configuration

### manifest.json

```json
{
  "name": "Invisible Journal",
  "short_name": "Invisible",
  "display": "standalone",  // No browser UI
  "icons": [/* feelings_wheel.png */]
}
```

### Capabilities
- Install to home screen (iOS/Android)
- Standalone app experience
- Custom splash screen
- Status bar theming

---

## Known Limitations & Design Decisions

### Why Single Line Mode is Recommended
- Cleaner visual experience
- Clearer deletion behavior
- Better performance
- More focused writing

### Why No Storage
- Core privacy feature
- Forces "letting go"
- Therapeutic benefit
- No data breach risk

### Why 200ms First Character Delay
- Prevents instant deletion on first keystroke
- Gives user a moment to see what they typed
- Feels more intentional

### Why Smart Speed System
- Prevents line overflow when typing fast
- Maintains smooth experience
- User doesn't have to manually adjust

---

## Future Enhancement Ideas

### Potential Features
- Sound effects (typing, particles)
- More particle effects (smoke, water, fire)
- Breathing exercise integration
- Session timer/counter
- Different canvas sizes
- Custom theme creator
- Multi-language support

### Non-Features (Intentionally Excluded)
- ❌ Save/export functionality
- ❌ Account system
- ❌ Cloud sync
- ❌ History/logs
- ❌ Undo functionality
- ❌ Copy/paste restrictions (users should have freedom)

---

## Development Guidelines

### Adding New Visual Effects

1. **Add option to HTML** (`index.html`):
```html
<button class="effect-btn" data-effect="new-effect">
  <span class="effect-icon">🔥</span>
  <span class="effect-label">Fire</span>
</button>
```

2. **Add case to switch** (`app.js` - `createVisualEffect()`):
```javascript
case 'new-effect':
  this.createNewEffect(char, x, y, color);
  break;
```

3. **Implement creator method** (`app.js`):
```javascript
createNewEffect(char, x, y, color) {
  this.particles.push({
    char, x, y, color,
    // Physics properties
    vx, vy,           // Velocity
    alpha: 1,         // Opacity
    size: 18,         // Font size
    decay: 0.01,      // Fade rate
    rotation: 0,      // Rotation angle
    rotationSpeed,    // Rotation velocity
    type: 'new-effect',
    // Custom properties...
  });
}
```

4. **Add update logic** (`app.js` - `updateParticles()`):
```javascript
case 'new-effect':
  // Update particle position/properties
  p.x += p.vx;
  p.y += p.vy;
  // Custom physics...
  break;
```

### Adding New Themes

1. **Add swatch to HTML** (`index.html`):
```html
<button class="theme-swatch" data-theme="new-theme">
  <span class="swatch-gradient theme-new-theme"></span>
  <span class="swatch-label">New Theme</span>
</button>
```

2. **Add CSS variables** (`styles.css`):
```css
body[data-theme="new-theme"] {
  --bg-primary: #color1;
  --bg-secondary: #color2;
  --text-primary: #color3;
  --text-secondary: #color4;
  --control-bg: rgba(...);
  --control-border: #color5;
  --shadow: rgba(...);
  --accent: #color6;
  --delete-btn: #color7;
}

.theme-new-theme {
  background: linear-gradient(135deg, #color1 0%, #color2 100%);
}
```

3. **JavaScript automatically handles** event listeners and URL encoding.

### Adding New Placeholder Phrases

Simply add to the array in `app.js`:
```javascript
this.placeholderPhrases = [
  "Existing phrase...",
  "New phrase..."  // Add here
];
```

Phrases automatically rotate randomly on page load and when text clears.

---

## Performance Considerations

### Optimization Strategies

**Canvas Performance:**
- `requestAnimationFrame()` for smooth 60fps
- Particle cleanup: Remove off-screen or alpha=0 particles
- Canvas clears completely each frame

**Deletion Loop:**
- Checks every 50ms (not every frame)
- Conditional execution based on layout mode
- Early returns prevent unnecessary work

**Event Listeners:**
- Debouncing not needed (deletion handles timing)
- Direct DOM manipulation (no virtual DOM overhead)
- Passive event listeners where possible

### Memory Management

**Particle Lifecycle:**
1. Created on character deletion
2. Updated each frame
3. Removed when dead (alpha=0 or off-screen)
4. Arrays are filtered, not just hidden

**State Cleanup:**
```javascript
// On text clear
this.particles = [];
this.currentText = '';
this.input.value = '';
```

---

## Common Modification Scenarios

### Changing Deletion Speed Range

Currently: 0-5 chars/sec with 0.2 increments

**To change:**
1. Update slider in HTML: `min`, `max`, `step` attributes
2. Update speed label display in `updateSpeedLabel()`
3. Update default in constructor: `this.speed = 1.0`

### Changing First Character Delay

Currently: 200ms

**To change:**
Update in `handleTextInput()`:
```javascript
this.lastDeletionTime = now - normalSpeed + 200;
//                                           ^^^
//                                      Change this value
```

### Changing Max Line Calculation

Currently: `fontSize * 0.6` character width estimate

**To change:**
Update in `updateMaxLineChars()`:
```javascript
const estimatedCharWidth = fontSize * 0.6;
//                                    ^^^
//                               Adjust multiplier
```

### Changing Canvas Height

Currently: 400px desktop, 200px mobile

**To change:**
Update in `setupCanvas()`:
```javascript
const isMobile = window.innerWidth < 768;
this.canvas.height = isMobile ? 200 : 400;
//                              ^^^   ^^^
```

---

## Debugging Tips

### Console Logging

The app logs character limit calculations:
```
Width: 850px, Font: 20.8px, Char width: ~12.48px, Max: 68
```

### Common Issues

**Particles not appearing:**
- Check canvas dimensions: `console.log(canvas.width, canvas.height)`
- Verify particle creation: `console.log(this.particles.length)`
- Check particle positions are within canvas bounds

**Deletion not working:**
- Verify `layoutMode === 'single'`
- Check `this.speed !== 0`
- Log deletion timing: `console.log('Deleting at', Date.now())`

**Theme not applying:**
- Check `data-theme` attribute on body element
- Verify CSS custom properties are defined
- Check browser console for CSS errors

**URL not updating:**
- Verify `updateURL()` is called after state changes
- Check `window.history.replaceState` is working
- Ensure settings aren't at default values (they're omitted)

---

## Code Style & Conventions

### Naming
- camelCase for variables/methods
- PascalCase for class name
- kebab-case for CSS classes/IDs
- UPPERCASE for constants (though few are used)

### Organization
- Methods grouped by functionality
- Section comments: `// ==================== Title ====================`
- DOM elements cached in constructor
- Event listeners in dedicated `setupEventListeners()` method

### Comments
- Method-level comments for complex logic
- Inline comments for non-obvious calculations
- TODO markers removed when implemented

---

## Testing Checklist

When making changes, verify:

- [ ] Works on desktop (Chrome, Safari, Firefox)
- [ ] Works on mobile (iOS Safari, Chrome Android)
- [ ] Settings persist in URL
- [ ] All visual effects work correctly
- [ ] Modal open/close functions properly
- [ ] Escape key closes modals
- [ ] Click outside closes modals
- [ ] Responsive layout doesn't break
- [ ] No console errors
- [ ] Privacy: No storage occurring
- [ ] Placeholder rotates correctly

---

## Quick Reference

### File Sizes (Approximate)
- `index.html`: ~200 lines
- `styles.css`: ~1000 lines
- `app.js`: ~900 lines
- `manifest.json`: ~20 lines

### Key Numbers
- 5 visual effects
- 10 theme options
- 4 font options
- 2 layout modes
- 14 placeholder phrases
- 0.2 second first char delay
- 0-5 chars/sec deletion speed range
- 50ms deletion loop check interval

### External Assets
- `feelings_wheel.png` - Used as:
  - Header button icon
  - Modal display image
  - PWA home screen icon
  - Browser favicon

---

## Deployment

### GitHub Pages Setup
1. Push to `main` branch
2. Enable GitHub Pages in repository settings
3. Source: `main` branch, root directory
4. Site available at: `https://talrme.github.io/invisible-journal/`

### No Build Process
- Pure static files
- No compilation needed
- No dependencies to install
- Direct deployment to any static host

---

## Contact & Maintenance

This is a complete, self-contained application with no external dependencies. All functionality is implemented in vanilla JavaScript with no frameworks or libraries.

**For Future AI/Developers:**
- Code is extensively commented
- Class-based structure is easy to extend
- No magic numbers (all configurable)
- Follow existing patterns for consistency
- Test on mobile devices frequently
- Maintain privacy-first philosophy

---

*Last Updated: December 2024*

