# Director Assistant — Camera Studio

A bilingual Persian/English, dependency-free cinematography learning and previs tool.


## v0.7 — A clearer shot-design workspace

The current homepage opens the unified studio. It keeps the existing 302 techniques, 251 editable camera paths and original local reference clips, 97 body records, 81 lens profiles, 35 transitions, scene tools and exports.

- **Preview and focus:** a clear current-shot heading, dedicated camera/scene/split views, an expandable focus mode, adjacent playback and time ruler, and guides fitted to the actual image rectangle for landscape, scope, square and portrait shots.
- **Readable Persian UI:** bundled Vazirmatn variable font with its SIL OFL license, RTL-aware layouts, separated bilingual technique names, translated subject/instance controls, consistent fields, visible keyboard focus and a horizontal mobile tool strip.
- **Faster browsing:** cached motion cards retain focus and scroll when selected; normalized Persian/Arabic letter search, all/3D/favorites filters, local favorites and an explicit empty state with recovery. Reference navigation reveals the current shot even after restrictive filters.
- **Useful controls:** quick save and export from the header; collapsible explanatory notes; mobile settings drawer with keyboard focus containment; keyboard-accessible tabs and scene orbit.
- **Rendering work:** the secondary 3D scene is not rebuilt/rendered while hidden. Unchanged select options and body comparisons reuse their DOM. Playback pauses when the page is hidden. If WebGL is unavailable, the camera area clearly labels an original recorded motion reference; it does not claim to render edited 3D settings, and frame guides are disabled in that fallback.

### Shortcuts

| Key | Action |
| --- | --- |
| Space | Play / pause |
| F | Enter / leave focus mode |
| G | Toggle frame guides |
| / | Search the motion library |
| Ctrl / Command + S | Save the current project in this browser |
| Escape | Close settings / leave focus |
| ? | Show shortcuts |

Single-key shortcuts do not intercept text inputs. Workspace tabs support RTL-aware arrow keys, Home and End. Focused scene canvas supports arrow-key orbit, plus/minus zoom and Home reset.

### Development and release validation

Run `python3 dev_server.py --port 3000` for a local static preview, or open `index.html` directly for normal offline use. No package installation is required. `npm run dev` is an optional wrapper.

`smoke_test.py` is the release gate in GitHub Actions. It checks actual WebGL pixels and transition textures, all 17 imported GLBs, original features and export data, the bundled offline font, cached library focus/scroll, empty search/favorites recovery, RTL tabs, focus/view modes, a 390px mobile layout, mobile settings keyboard behavior, portrait guide bounds and a short laptop viewport. A successful run and Pages deployment are required before calling a release verified.

Historical feature notes below describe earlier editions; the sections for v0.6 and v0.7 describe the current studio. Preview and export limitations remain documented with each feature.

## Run
Open `index.html` in a modern browser. No installation, build step, API key or network dependency.
For clipboard support, use localhost or HTTPS:
```sh
python -m http.server 8000
```
Then open http://localhost:8000.

## Original Camera Lab features (archived)
- 15 animated camera movement presets, explanations and warnings.
- Synchronized perspective camera preview and X-Z overhead movement path with field-of-view cone.
- 7 shot-size presets, 6 camera-angle presets, 8 rigs, 6 camera body categories.
- Adjustable focal length, distance, height, duration and 5 aspect ratios.
- Play/pause, restart and timeline scrubbing.
- English shot prompt and JSON export with 25 sampled keyframes.
- Search and bilingual field reference.

## Original Camera Lab limitations (archived)
Educational schematic preview, not a photorealistic renderer. Pinhole projection assumes a 36 mm horizontal sensor. No exposure, depth of field, lens distortion, motion blur, collision or physical rig constraints. Shot sizes are approximate presets. Overhead presets start vertically and adapt dolly and pan to the optical axis; tilt, arc and crane can depart from exact vertical. Export is an application JSON format, not FBX or Blender import. Camera body and rig choices are reference metadata; they do not change optical simulation.

## Original Camera Lab validation (archived)
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


## Offline Edition (v0.3)
`references.html` now uses only local HTML5 video files. It has all 126 catalog techniques and existing dedicated AI prompts; 66 original schematic MP4 files and 18 explicitly labeled related-motion aliases. No third-party videos have been downloaded or mirrored. Entries without footage accept local personal clips for the current session. The original external-source catalog is preserved separately as `online-references.html`, not loaded by the offline page.

Build the local videos (Python 3, NumPy, OpenCV and FFmpeg with libx264):
```sh
python -m pip install numpy opencv-python-headless
python build_media.py
```
Open `references.html` directly with `camera-library.js`, `offline-media.js` and the `media/` folder in the same directory. No remote requests are required. All clips are 480x270 H.264, 24 fps, 3 s, silent; static framing examples hold a static shot. The renderer is an educational previs model, not the original film footage or a full physically correct optics/rig simulation. For a Pages build, package these local assets together. Actual browser playback still needs verification; the local container Chromium blocked file/localhost navigation.

### GitHub Pages and CI
The `offline-site.yml` workflow renders and verifies MP4 files, produces a portable ZIP artifact, commits the generated files (without force-pushing), then deploys the static site via GitHub Pages. In repository Settings → Pages → Build and deployment, select **GitHub Actions** if Pages is not already configured. Workflow execution, media commit and public Pages availability must be checked in Actions/Pages; adding the workflow alone does not establish that they succeeded.


## v0.4 — Director Assistant workspace
The homepage is now an entry point for the local atlas, original Camera Lab (`lab.html`), WebGL studio, body/optics comparison, and optional online source directory. 

- **228 technique records** in **15 categories**, including 102 newly authored techniques and 9 newly covered existing entries. 177 distinct authored 3-second H.264 previews (66 existing + 111 additional), 18 labeled related-motion aliases and 33 catalog-only entries. 177 corresponding 3D editable paths.
- **97 real model/family records from 12 manufacturers**, with official source links, 9 nominal sensor formats, 23 focal-length options, search/filters and side-by-side horizontal field-of-view calculations. Widths marked exact are manufacturer figures; other widths are nominal format presets; actual mode/crop may vary. Specialized cameras without a usable rectilinear sensor width do not receive a misleading FoV value. A body selection controls sensor width, not a brand-specific color response or CAD model.
- **3D studio**: original procedural mesh scenes (street, stage, corridor), mannequin/robot/sphere and multiple-subject setups, WebGL depth testing, editable evenly spaced keyframes, key insertion/deletion, lens multiplier, sensor width, character height, six aspect ratios, playback, interactive world orbit, local project save/load. Exports JSON sampled at 24 fps, current-scene OBJ, generated Blender Python import script with static scene geometry and animated camera, and browser video capture. The static geometry in Blender does not animate characters; Blender import/capture require user-side runtime validation. No optical DOF, collision, branded CAD or physical camera simulator claimed.
- `motion-paths.json` is the canonical new trajectory dataset; `motion-paths.js` mirrors it for direct file:// browsing. `legacy-motion-paths.js` samples the previous renderer's trajectories. `build_media.py` generates or validates local media. No third-party video is mirrored. The old online source directory remains optional; normal pages load local assets only.
- Offline package: download `CameraAtlas-Offline.zip` from the deployed website or GitHub Actions, extract, open index.html. The workflow copies all local assets and packages the ZIP; Pages serves the actual MP4 files, not external players.

## v0.5 — Timing, composition and original cinematic sets
- 302 technique records / 16 categories, 251 distinct editable trajectories and local 3-second video targets, including 40 newly composed camera motions and 34 apples-to-apples easing comparisons. 18 entries use explicitly labeled related-motion aliases and 33 remain catalog-only. Previously generated video files are retained.
- 34 easing choices: linear, smoothstep, smootherstep, custom cubic Bezier, and in/out/in-out variants of quad, cubic, quart, quint, sine, expo, circ, back, elastic and bounce. Whole-shot and per-segment application. Two graphs show normalized parameter progress and velocity; physical speed along a non-uniform spatial path may differ. Overshooting curves may reverse motion. Bézier controls are editable numerically or by dragging.
- Layered composer adds up to two motion paths to the current primary path in world coordinates. Independent translation, aim, focal-length and roll channels, signed strengths, per-layer ease, simultaneous or sequential mode, 97 editable keys and undo. Aim uses unwrapped yaw/pitch deltas; this is a deterministic approximation rather than a physical camera rig, and scene collisions are not simulated. Existing subject motion follows the primary path.
- Nine original procedural low-poly environments: architectural street, soundstage, corridor, mountain forest, snow village, desert/caravanserai, harbor, classical courtyard, interior. Background geometry, directional sky gradient, fog and six lighting palettes (day/golden/overcast/blue/night/clay); optional distant scenery and measurement grid. Four extra procedural subject meshes (coated hero, car, quadruped, statue). Scene geometry is cached by environment/background/grid. Native preview and browser recording use the same scene/timing sampler. OBJ includes vertex colors as an optional widely used extension; Blender script creates colored static geometry, world and sun plus sampled camera animation. Real shadows, DOF, PBR materials, collisions and photorealistic lighting are not simulated. The offline MP4 comparison clips remain schematic renderings, not recordings of the new interactive WebGL sets. Blender execution and browser codec capture are not automatically verified.

## v0.6 — Unified cinematography workspace
The site root, former atlas and body-catalog URLs now enter the same studio, preserving query parameters. One preview stays visible on desktop while library, lenses, scene/models, transitions, timing, composer, keyframes and exports are switched in tabs. The old classic simulator and optional online sources remain available by direct link. Frame guides are UI overlays, not baked into video.

**Optics:** 81 selectable profiles (80 lens presets plus authored-path mode) including rectilinear primes (8–800 mm), 13 zoom ranges, anamorphic 1.33/1.5/1.8/2x, macro, approximate fisheye, tilt-shift, soft/vintage/pinhole/probe and radial distortion looks. Horizontal projection genuinely responds to squeeze and sensor width; fixed prime profiles override focal animation, zoom preserves variation within its range. Aperture/focus/CoC yield thin-lens DOF estimates, not rendered physical DOF; distortion, softness, vignette and shift are image-space approximations. Integrated search and comparison of 97 body records preserves nominal/exact width labels.

**Transitions:** 35 actual two-shot compositor choices (cut, dissolve, dip, wipes, pushes, iris, zoom, whip, spin, defocus, flash, glitch, film burn, luma, ripple and more). Shot B has an independent motion preset and environment; adjustable overlap, shared optical settings. Program preview and browser video capture use the same compositor; JSON includes both paths and transition timing. Blender export remains shot A plus colored static geometry; it does not include compositor effects or exact anamorphic distortion. Match cut requires authored framing. No physical motion blur.

**Imported 3D assets:** 17 actual Kenney CC0 GLB models, pinned to the upstream mirror commit in asset-manifest.json. The CI fetches them once, verifies Git blob hashes and GLB headers, stores original GLBs and creates a self-contained base64 bundle. No runtime external model requests. Local import supports static GLB/glTF 2.0 with companion buffers/images and OBJ/MTL, 30 MB per selection and 180k triangles per mesh; 12 placed instances / 220k imported triangles. Nodes/transforms, material factors and sampled triangle colors are supported. No FBX, Draco/meshopt decoding, skeletal animation or full textured PBR. Personal imports persist in IndexedDB when available; project saves retain instance placement metadata. A default imported character is loaded if the verified asset bundle is available; procedural fallback otherwise. Original model creators: Kenney, CC0 1.0; see asset-manifest.json for individual official source pages and pinned original paths.

**Release pipeline:** GitHub Actions downloads the licensed models, verifies the local MP4 and GLB files, packages a ZIP and runs Chromium/WebGL smoke tests with all external runtime requests blocked. Generated binary assets and the JS bundle are committed on successful build. GitHub Pages deployment runs after the build/test gate. No media generation is claimed complete before the build finishes.
