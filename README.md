# BAPE Legit Check Trainer

A modern, fast, and visually appealing web-based legit check training application for the BAPE community. Designed as a single-page React application to help users sharpen their legit checking skills using real Reddit posts from r/bapeheads.

---

## Features

- **Game Mechanics**
  - Presents real Reddit posts with images for legit checking.
  - User selects LEGIT ✓ or FAKE ✗.
  - Verifies answers against Reddit comment consensus.
  - Tracks score, accuracy, and streak.
  - Shows relevant comments explaining verdicts.

- **Smart Loading Strategy**
  - Loads posts in batches (10-20) for instant start.
  - Background fetches more posts while playing.
  - Caches posts in localStorage for instant repeat visits.
  - Shuffle without repeats during session.
  - Loading indicators for background fetches.

- **Time Period Filter**
  - Select Reddit post time frame before playing:
    - Last 24 Hours
    - Last 3 Days
    - Last Week
    - Last Month
    - Last Year
    - All Time

- **Modern UI/UX**
  - Dark mode by default with toggle.
  - BAPE streetwear inspired colors and camo green accents.
  - Smooth animations and transitions.
  - Mobile responsive with large, thumb-friendly buttons.
  - Zoomable and pannable image viewer with gallery thumbnails.
  - Keyboard shortcuts for quick answers and navigation.

- **Smart Reddit Integration**
  - Filters posts with legit check keywords in title or flair.
  - Analyzes Reddit comments for legit/fake consensus.
  - Weighted scoring for verified checkers and comment upvotes.
  - Flags uncertain or community split posts.

- **Learning Mode**
  - Option to show answer first.
  - Detailed breakdown of comments voting legit/fake.
  - Link to original Reddit post.
  - Report issues for incorrect verdicts.

- **Settings Panel**
  - Toggle animations.
  - Image quality options.
  - Dark mode toggle.
  - Keyboard shortcuts toggle.
  - Learning mode toggle.

- **Additional Quality of Life**
  - Skip button.
  - Next random button avoiding sequential repeats.
  - Toast notifications for feedback.
  - Accessible with keyboard navigation and screen reader support.

---

## Prerequisites

- Node.js v18 or above (recommended)
- npm v9 or above (comes with Node.js)

---

## Installation

Clone the repository:

    git clone https://github.com/Tight-Purpose5316/bape-lc-trainer.git
    cd bape-lc-trainer

Install dependencies:

    npm install

---

## Configuration

This app uses Reddit's public JSON API and requires no API keys or secrets.

No additional environment variables are needed.

---

## Running the Application

Start the development server:

    npm start

This will open the app in your default browser at `http://localhost:3000`.

---

## Building for Production

To create a production build:

    npm run build

The optimized files will be in the `build` folder.

---

## Usage Guide

1. On first load, select a time period filter (e.g., Last Week).
2. The app will load legit check posts from r/bapeheads for that period.
3. The first post image appears with zoom and pan support.
4. Choose LEGIT or FAKE based on your judgment.
5. See instant feedback based on Reddit community consensus.
6. View relevant comments explaining the verdict.
7. Use Skip or Next buttons to navigate.
8. Toggle Learning Mode to see answers first and comments breakdown.
9. Use keyboard shortcuts:
   - `L` for Legit
   - `F` for Fake
   - `→` or `D` for Next
   - `←` or `A` for Skip
10. Access Settings to customize experience.
11. Score and accuracy are tracked live.

---

## Troubleshooting Common Issues

- **No posts loaded or empty screen**:
  - Try selecting a different time period.
  - Check your internet connection.
  - Reddit API may be temporarily unreachable.

- **Images not loading**:
  - Ensure your network allows access to Reddit image URLs.
  - Reload the page.

- **Keyboard shortcuts not working**:
  - Ensure the app window is focused.
  - Check settings panel to confirm shortcuts are enabled.

- **Dark mode not applying**:
  - Dark mode is enabled by default, but can be toggled in Settings.

---

## Project Structure

