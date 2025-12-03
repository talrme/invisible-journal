# Invisible Journal ✍️

A therapeutic journaling web app where your words disappear as you write. Nothing is saved, nothing is stored - pure ephemeral expression.

## Concept

Invisible Journal provides a safe space for stream-of-consciousness writing without the pressure of permanence. Your thoughts fade away as you type, encouraging authentic self-expression without worry about judgment, storage, or future consequences.

## Features

### Disappearing Modes
- **Fade Out**: Text gradually becomes transparent and vanishes
- **Character Deletion**: Letters delete one by one from the beginning
- **Particle Burst**: Characters explode into particles and float away
- **Blur & Fade**: Text blurs out before disappearing
- **Type & Erase**: Text erases as you continue typing

### Controls
- **Mode Selector**: Choose your preferred disappearing effect
- **Speed Control**: Adjust how quickly text disappears (slow/medium/fast)
- **Delete All**: Clear everything instantly with a satisfying animation

### Visualization Options
- **Theme Toggle**: Light and dark modes
- **Background Options**: Calming colors and subtle gradients
- **Font Options**: Different typefaces for different moods

## Privacy

**IMPORTANT**: This app stores NOTHING. No local storage, no cookies, no server communication. When text disappears, it's gone forever. This is by design for maximum privacy and peace of mind.

## Technical Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- Canvas API for particle effects
- CSS animations for smooth transitions
- RequestAnimationFrame for performance

## File Structure

```
invisible-journal/
├── index.html          # Main application
├── styles.css          # Styling and animations
├── app.js              # Core logic and effects
└── README.md           # This file
```

## Development Notes

### Key Components

**app.js** contains:
- `DisappearingText` class: Main controller for disappearing effects
- Effect implementations: Each mode has its own method
- Animation loop: Uses requestAnimationFrame for smooth performance
- Event handlers: Keyboard input, mode switching, controls

**styles.css** contains:
- Layout: Centered textarea with minimal UI
- Themes: Light/dark mode variables
- Animations: Transitions and keyframe animations
- Responsive: Mobile-friendly design

### Future Enhancement Ideas
- Sound effects for typing/disappearing
- More animation modes (wave effect, spiral, etc.)
- Breathing exercise timer integration
- Word count before deletion
- Export last session option (opt-in)

## Usage

Simply open `index.html` in a web browser. No build process or server required.

## License

Free to use and modify.

