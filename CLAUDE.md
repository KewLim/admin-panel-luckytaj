## CSS Best Practices

- Always split mobile and desktop CSS selectors
- Consider using `display: grid` with `grid-template-columns` for more flexible and responsive layouts instead of `display: flex`

## AI Edge Effects

### AI-Glowing-1 (Pulse Border Effect)

**Call this:** "AI-Glowing-1"

For creating buttons with animated pulsing glowing borders:

```css
.ai-button {
    border: 2px solid #00d4ff;
    border-radius: 6px;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    animation: glowPulse 2s ease-in-out infinite alternate;
    transition: transform 0.3s ease;
}

@keyframes glowPulse {
    0% {
        box-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
        border-color: #00d4ff;
    }
    100% {
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
        border-color: #5b86e5;
    }
}
```

Key features:
- 2-second pulse cycle with `alternate` direction
- Glow grows from 5px to 20px
- Border color shifts from cyan (#00d4ff) to blue (#5b86e5)
- Always active animation for AI/futuristic feel

### AI-Glowing-2 (Light Sweep Effect)

**Call this:** "AI-Glowing-2"

For elements that need a scanning/sweeping light beam effect:

```css
.ai-generate-section::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s;
}

.ai-generate-section:hover::after {
    left: 100%;
}
```

Key features:
- Light beam sweeps from left to right
- Semi-transparent white overlay effect
- Triggered on hover
- Creates scanning/AI processing feel

## Development Workflow

- Make sure you save all the file before you continue to amend everything I told you

## Server Management

- When I say "start", start/restart the server for admin panel and front end, and diagnose the server connection make sure it Is work.

## API and Integration

- When linking any section of admin panel to front end, ensure the API is perfectly configured to pull live data from the admin-controlled database
- Verify that the admin panel is fully functional before establishing front-end connections