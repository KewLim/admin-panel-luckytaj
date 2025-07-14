# 🔧 Daily Trending Game Spin Wheel - Build Instructions

This page is designed to increase user engagement by showing a daily spin wheel that selects and displays 3 trending games with winning comments and images.

## ✅ What To Do:

1. Build a spin animation component that triggers on page load.
2. After spin completes, show 3 game cards from a rotating game pool.
3. Each game card should include:
   - Game title
   - Thumbnail
   - A (fake or anonymized) winning comment
   - A (fake or placeholder) winning screenshot
4. The games change daily based on current date.
5. Use JSON or fake API as the data source.

## ❌ What NOT To Do:

- ❌ Do not show real usernames, player IDs, or identifiable information.
- ❌ Do not include real betting, account, or payment logic.
- ❌ Do not implement backend gambling logic.
- ✅ Placeholder images or blur/fake comments are allowed.

## 💡 Technical Notes:

- Game pool should be ~10 titles; rotate using date-based modulo logic.
- Use a modern frontend framework like Vue 3 or React.
- Add visual polish (animation, gold effects, game-like UI).

## 📦 Suggested Tools:

- Vue 3 + Tailwind + GSAP  
  OR  
- React + Tailwind + Framer Motion

- Optional fake API: JSON Server or static JSON



===== 14/7 conversation summary =====


Based on our conversation history, here's a comprehensive checklist of all UI/UX, layout,
  styling, and functional requirements:

  VIEWPORT & LAYOUT STRUCTURE

  - Force fixed mobile viewport: 390px × 844px on ALL devices (desktop and mobile)
  - Lock layout to prevent stretching/repositioning on larger screens
  - White background outside the fixed viewport area
  - Center the mobile layout horizontally on larger screens
  - Use viewport meta tag: width=390, initial-scale=1.0, user-scalable=no
  - Mobile-wrapper container with fixed dimensions and overflow handling
  - All containers max-width: 360px with margin: 0 auto for centering

  BRANDING & COLOR SCHEME

  - LuckyTaj branding colors: #151a43 (primary blue), #ff9a39 (orange accent)
  - Gradient backgrounds: linear-gradient(135deg, #151a43 0%, #1a2050 100%)
  - Orange accent gradients: linear-gradient(45deg, #ff9a39, #fe4a3f)
  - Use LuckyTaj logo: https://www.luckytaj.com/luckytaj/img/logo.png

  NAVIGATION BAR

  - Fixed top navbar: 60px height, positioned absolute
  - Background: #151a43 with rgba(255, 154, 57, 0.2) border
  - Logo on left, Login + "Play Now" buttons on right
  - "Play Now" button with orange gradient and hover effects
  - Box-shadow and z-index: 1000 for overlay

  RESPONSIVE SIZING (CONVERTED TO FIXED VALUES)

  - Replace ALL clamp() functions with fixed pixel values for 390px layout
  - No viewport-based units (vw, vh) - use fixed px values only
  - Container padding: 15px consistent across all sections
  - Gap spacing: 8px, 12px, 15px, 20px standard increments

  TAP HIGHLIGHTS & FOCUS STATES

  - Remove blue tap highlights: -webkit-tap-highlight-color: transparent
  - Apply to all interactive elements: buttons, a, .game-card, .nav-link
  - Custom focus states with orange outline: box-shadow: 0 0 0 2px rgba(255, 154, 57, 0.5)
  - Remove default button outlines: outline: none

  LAZY LOADING SYSTEM

  - Intersection Observer API with 100px rootMargin and 0.1 threshold
  - Image lazy loading with data-src attributes
  - Loading skeletons for images and videos
  - Fade-in transitions: opacity 0.6s ease
  - Auto-observe newly created dynamic elements
  - Immediate loading for viewport-visible elements after creation

  IMAGE LOADING & SKELETONS

  - Loading skeletons with shimmer animations
  - Skeleton-to-content fade transitions (300ms)
  - Error handling with fallback SVG placeholders
  - Image dimensions maintained during loading
  - Progressive loading with smooth opacity transitions

  SLOT MACHINE ANIMATION

  - 3-reel slot machine with golden border (#ff9a39)
  - Spinning animation with sequential 500ms delays per reel
  - Background: linear-gradient(145deg, #1e2654, #252d63)
  - Golden glow border animation with 3s infinite alternate
  - Reel dimensions: 75px width × 90px height
  - Auto-spin on page load after 1000ms delay
  - Slot machine pulse animation (8s infinite ease-in-out)

  TRENDING GAMES SECTION

  - Grid layout: 3 columns for mobile (grid-template-columns: repeat(3, 1fr))
  - Game cards with CSS Grid internal layout (4 rows: thumbnail, title, screenshot, wininfo)
  - Card dimensions: 80px thumbnail, 40px title, 60px screenshot, flexible wininfo
  - Backdrop-filter: blur(10px) with rgba transparency
  - Sequential card pulse animation (6s cycle, 2s delay between cards)
  - Staggered fade-in animation (200ms delay per card)
  - Hover effects: translateY(-10px) with enhanced shadows

  CARD ANIMATIONS & EFFECTS

  - Card pulse sequence: Scale 1.05 with enhanced shadows at 10% keyframe
  - Border color transitions: white → orange during pulse
  - Box-shadow progression: standard → enhanced glowing shadows
  - Animation-play-state: paused on hover
  - Smooth transform transitions (0.3s ease)

  VIDEO SECTION

  - YouTube iframe with lazy loading and data-src pattern
  - Video skeleton with play button icon and shimmer text
  - Date-based video selection (consistent daily video)
  - Loading delay simulation (800-1500ms range)
  - Overlay play indicator with orange styling
  - Background gradient overlay with accent colors

  SHARE FUNCTIONALITY

  - WhatsApp-style share button with green gradient (#25d366, #128c7e)
  - Screenshot capture using html2canvas library
  - Web Share API integration with fallback mechanisms
  - Image download + WhatsApp URL sharing as fallback
  - Animation: bounce effect for share icon (2s infinite)
  - Shine effect on hover (sliding highlight)

  NOTIFICATION SYSTEM

  - Browser notification permission request (3s delay after load)
  - Custom notification prompt with allow/deny options
  - Daily scheduling at 12 PM GMT+5:30 timezone
  - Notification content: game tips with title and recent win amount
  - Auto-dismiss prompt after 10 seconds
  - Success/error feedback messages

  LOADING SEQUENCES & DELAYS

  - Auto-spin slot machine: 1000ms after page load
  - Video loading: 500ms delay for performance
  - Trending games display: 700ms after slot animation
  - Card animations: 200ms stagger per card
  - Notification request: 3000ms after initialization
  - Image loading: immediate for viewport-visible, lazy for others

  DATA MANAGEMENT

  - Date-based deterministic game selection using modulo logic
  - JSON data structure with game images, screenshots, win amounts
  - Fallback error handling for failed data loads
  - Base64 SVG placeholders for missing images
  - Daily rotation system (days since epoch % games pool length)

  TYPOGRAPHY & TEXT EFFECTS

  - Font family: Arial, sans-serif
  - Text shadows for depth: 2px 2px 4px rgba(0,0,0,0.3)
  - Responsive font sizes converted to fixed pixel values
  - Color hierarchy: white primary, rgba(255,255,255,0.9) secondary
  - Bold weights for headings and CTAs

  BUTTON STYLING & INTERACTIONS

  - Border-radius: 20-25px for rounded buttons
  - Gradient backgrounds with hover state inversions
  - Transform effects: translateY(-2px) on hover
  - Enhanced shadows on hover states
  - Transition duration: 0.3s ease for all interactive elements
  - Active states with reduced transform and shadows

  CONTAINER HIERARCHY & SPACING

  - Main container: max-width 360px, centered with auto margins
  - Section spacing: 20-30px bottom margins
  - Internal padding: 15-20px consistent across components
  - Grid gaps: 8px for tight layouts, 12-15px for comfortable spacing
  - Vertical rhythm with consistent margin-bottom values

  ANIMATION PERFORMANCE

  - CSS transforms for animations (not position changes)
  - Hardware acceleration with transform3d hints
  - Animation-fill-mode: both for smooth start/end states
  - Reduced motion considerations with appropriate timing
  - Staggered animations to prevent overwhelming users

  ERROR HANDLING & FALLBACKS

  - Graceful degradation for unsupported features
  - Fallback SVG images for broken image URLs
  - Web Share API fallback to manual URL opening
  - Screenshot failure fallback to text-only sharing
  - Notification API feature detection and graceful failure

  CROSS-DEVICE CONSISTENCY

  - Fixed pixel values instead of responsive units
  - Consistent touch targets (minimum 44px for accessibility)
  - Uniform spacing and sizing across all screen sizes
  - Locked viewport prevents zoom/pan issues
  - Touch-friendly interaction areas with proper padding

  VISUAL HIERARCHY & DEPTH

  - Layered shadows for depth perception
  - Gradient overlays for visual interest
  - Border accents with brand colors
  - Backdrop filters for modern glass-morphism effects
  - Z-index management for proper layering

  This comprehensive checklist covers all the specific requirements, animations, styling
  patterns, and functional behaviors from our conversation and can be directly referenced for
   future projects.



