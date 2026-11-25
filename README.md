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
Educational schematic preview, not a photorealistic renderer. Pinhole projection assumes a 36 mm horizontal sensor. No exposure, depth of field, lens distortion, motion blur, collision or physical rig constraints. Shot sizes are approximate presets. Top-down view prioritizes a vertical orientation; some movement presets are constrained in this mode. Export is an application JSON format, not FBX or Blender import. Camera body and rig choices are reference metadata; they do not change optical simulation.

## Validation
Movement sampling tested for finite transforms, locked camera, stationary pan/zoom positions, forward dolly, centered projection and overhead target. Browser interaction and visual QA still required.

## License
No license has been selected yet.