# Director Assistant — Camera Lab

A bilingual Persian/English, dependency-free cinematography learning and previs tool.

## Run
Open `index.html` in a modern browser. No installation, build step, API key or network dependency.
For clipboard support, use localhost or HTTPS:
```sh
python -m http.server 8000
```
Then open http://localhost:8000.

## Features
- 15 animated camera movement presets, explanations and warnings.
- Synchronized perspective camera preview and X-Z overhead movement path with field-of-view cone.
- 7 shot-size presets, 6 camera-angle presets, 8 rigs, 6 camera body categories.
- Adjustable focal length, distance, height, duration and 5 aspect ratios.
- Play/pause, restart and timeline scrubbing.
- English shot prompt and JSON export with 25 sampled keyframes.
- Search and bilingual field reference.

## Model limitations
Educational schematic preview, not a photorealistic renderer. Pinhole projection assumes a 36 mm horizontal sensor. No exposure, depth of field, lens distortion, motion blur, collision or physical rig constraints. Shot sizes are approximate presets. Overhead presets start vertically and adapt dolly and pan to the optical axis; tilt, arc and crane can depart from exact vertical. Export is an application JSON format, not FBX or Blender import. Camera body and rig choices are reference metadata; they do not change optical simulation.

## Validation
Movement sampling tested for finite transforms, locked camera, stationary pan/zoom positions, forward dolly, centered projection and overhead target. 480 finite-transform and normalized-axis checks across standard/overhead movement presets passed, plus 23 mock DOM/canvas smoke checks (initial render, language, timeline, play/reset, angle and movement selection). Real browser and visual QA still required.

## License
No license has been selected yet.

## Camera Atlas (v0.2)
Open `references.html` from Camera Lab. It contains 126 individually described camera techniques in 12 categories, 16 original YouTube videos and 121 chapter links (some links share the same original video), plus official model guidance and galleries. The dataset is in `camera-library.js`.

- Search English/Persian, category/source filters, favorites stored locally, and one on-demand embedded player with original-source fallback.
- Per-technique reusable English camera prompt; subject, duration and image/video-reference workflow controls. Compatible moves link back to the existing simulator.
- Third-party video is embedded from YouTube or linked to the original publisher, not downloaded or redistributed. Source pages may contain demos and text, not individually embedded videos. Embeddability and playback depend on the publisher/browser. The link index and JS syntax were checked; full browser/media playback QA is pending. Do not use third-party footage as model input without appropriate rights. AI camera prompts are guidance, not guaranteed motion.

### Original motion reference export
Camera Lab includes a reverse-trajectory control and a clean, silent browser-recorded camera reference export at a nominal 24 fps. The export uses the existing schematic preview without guides; MediaRecorder chooses MP4 or WebM depending on browser support. Keep the tab active during recording. The export is not a true Blender render, and browser timing/codec support is not guaranteed. Reverse atlas links start at the original trajectory endpoint. Data, syntax, UI logic, prompt composition, source links and reverse controls passed mock DOM checks; actual video capture and third-party playback still require real-browser testing.
