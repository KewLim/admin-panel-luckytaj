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
