# Invisible Journal ✍️

**[🌐 View Live Website](https://talrme.github.io/invisible-journal/)**

## Concept

Invisible Journal provides a safe space for stream-of-consciousness writing without the pressure of permanence. Your thoughts fade away as you type, encouraging authentic self-expression without worry about judgment, storage, or future consequences.

## Features

### Disappearing Effects
- **🪐 Drop**: Characters fall with gravity and bounce
- **✨ Dissolve**: Text breaks into particles and fades away
- **💥 Explode**: Letters burst outward in all directions
- **🌀 Spiral**: Characters spiral outward in a hypnotic pattern
- **🎲 Scatter**: Random chaotic movement in all directions

### Layout Modes
- **Single Line**: Text deletes character-by-character from the beginning as you type (recommended)
- **3 Lines**: Multiline mode where text fades in place after appearing

### Customization
- **Minimum Disappearing Speed**: Adjustable slider from 0 (never) to 5 chars/sec
  - Smart speed: Automatically increases when the line is full and you're still typing
- **10 Theme Options**: Complete color combinations including backgrounds and text colors
  - Light Blue (default), Dark, Warm, Dark Warm, Forest, Dark Forest, Lavender, Dark Lavender, Minimal, Dark Minimal
- **4 Font Options**: Serif, Sans-Serif, Monospace, Handwriting
- **Feelings Wheel**: Visual tool to help identify and express emotions

### Smart Features
- **Random Placeholder Phrases**: 14 rotating inspirational prompts that refresh when text disappears
- **URL State Persistence**: All settings are encoded in the URL for sharing and bookmarking
- **0.2 Second Grace Period**: First character waits 200ms before starting to disappear
- **Mobile Optimized**: Responsive design works perfectly on phones and tablets
- **PWA Ready**: Install to home screen with feelings wheel icon

### Privacy
**IMPORTANT**: This app stores NOTHING. No local storage, no cookies, no server communication. When text disappears, it's gone forever. This is by design for maximum privacy and peace of mind.

## Technical Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- Canvas API for particle effects
- CSS custom properties for theming
- RequestAnimationFrame for smooth animations
- Progressive Web App (PWA) capabilities

## File Structure

```
invisible-journal/
├── index.html          # Main application structure
├── styles.css          # Styling, themes, and animations
├── app.js              # Core logic and particle effects
├── manifest.json       # PWA configuration
├── feelings_wheel.png  # Feelings wheel reference image
├── README.md           # This file
└── AI_DOCS.md          # Technical documentation for AI/developers
```

## Key Components

### app.js
- `InvisibleJournal` class: Main application controller
- Character-by-character deletion with smart speed control
- 5 distinct particle effect implementations
- URL parameter management for settings persistence
- Modal system for settings and feelings wheel

### styles.css
- 10 complete theme combinations with CSS variables
- Responsive design with mobile-first approach
- Modal system with animations
- Custom styled buttons and controls (no default dropdowns)

### index.html
- Clean semantic structure
- Settings modal with button-based controls
- Feelings wheel modal for emotional reference
- PWA meta tags for home screen installation

## Usage

Simply open the [live website](https://talrme.github.io/invisible-journal/) or open `index.html` in a web browser. No build process or server required.

## Installation as App

**On iPhone/iPad:**
1. Open in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. App icon will be the feelings wheel

**On Android:**
1. Open in Chrome
2. Tap menu (⋮)
3. Tap "Install app" or "Add to home screen"
4. App icon will be the feelings wheel

## License

Free to use and modify.
