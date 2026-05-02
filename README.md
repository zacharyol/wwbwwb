# We Become What We Behold

A standalone and playable local version of [We Become What We Behold](https://ncase.itch.io/wbwwb) by Nicky Case.

## How to Play

### Option 1: Standalone Local File
Simply double-click `wbwwb_standalone.html` to play the game locally in your browser. All images, sounds, and scripts have been packaged into this single file so it doesn't require a web server to run.

### Option 2: Web Server
If you want to play the original version, run a local web server in this directory:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

### Option 3: GitHub Pages
Since this is a static web game, you can easily host it for free using GitHub Pages. Just go to your repository settings on GitHub, enable GitHub Pages, and point it to the `main` branch!

## Building the Standalone File
If you modify the source code, images, or sounds, you can repackage the standalone file by running:
```bash
python build.py
```
