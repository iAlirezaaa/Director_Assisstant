# Camera Studio — design QA

**Final result: passed.** Version 0.8.1 passed its full browser release gate and Pages deployment. Native desktop and phone screenshots were reviewed; the corrected mobile shell and starter-character direction are verified. No unresolved P0/P1 interface issue was found in the reviewed scope.

Review date: 2026-11-26 (Asia/Tehran). Scope: the approved beginner-first design, the current movement desktop state, and the corrected mobile shell. The interface comparison is bounded to the supplied concepts and exercised states. The linked release gate covers the existing application regression suite; no pixel-identical cinematic rendering claim is made.

## Reference and capture evidence

All approved sources are **1672 × 941** PNGs. The movement overview and Dolly detail were inspected with the latest desktop capture in the same image-viewing input. The other supplied concepts establish the shared design language and section structure.

| Evidence | Absolute path |
| --- | --- |
| Approved movement overview | `/workspace/scratch/c10a418ba7fc/design-references/chat_files/3959ac0ea414754113d86fde47d82d95f0dba3b98cc43b1db115be9fe7a199e9/image-0.png` |
| Approved Dolly detail | `/workspace/scratch/c10a418ba7fc/design-references/chat_files/7a7dc6fc533d3f201ffc8f311e4188a67abfc0e480ecb78767990ba2d2ff8ab2/image-0.png` |
| Approved frame/lens concept | `/workspace/scratch/c10a418ba7fc/design-references/chat_files/a37748b7606d0b87bb04c5ad8ffeb21d459962615004d465dbd5f7de4ef5bb79/image-0.png` |
| Approved transition concept | `/workspace/scratch/c10a418ba7fc/design-references/chat_files/a50ac951c141145128176e6aebc6f55917a9fbfc521713ee22ac87f050d5029c/image-0.png` |
| Approved export/help concept | `/workspace/scratch/c10a418ba7fc/design-references/chat_files/efc2a6603ca7c71fb230550e32f9c1058881bb5f541ba249935e8c750b7c7606/image-0.png` |
| Approved scene/model concept | `/workspace/scratch/c10a418ba7fc/design-references/chat_files/33012102388eb25fce8d439411392433ffc4824db447ac06e31d2ec75c66bb9c/image-0.png` |
| Current desktop, after overlay/type corrections | `/workspace/shared/camera-studio-qa/desktop-1672-after.png` |
| Current mobile, after width/header corrections | `/workspace/shared/camera-studio-qa/mobile-390-after.png` |
| Earlier native-size desktop capture, historical only | `/workspace/shared/camera-studio-qa/desktop-1672.png` |

**Capture dimensions:** the current desktop file is physically **1363 × 767**. The browser test used a **1672 × 941 iframe**, with the host screenshot returned at a smaller raster size; the test agent confirmed that the iframe and its wrapper did not use a CSS transform. Treat this as a scaled capture of the 1672 × 941 layout, not a native-resolution typography measurement. The older desktop file is 1672 × 941 but predates the latest corrections. The mobile file is a **1363 × 936 outer-browser capture** containing a **390 px-wide iframe** at the left; the empty outer area is not page overflow.

## Visual comparison

| Area | Observation and fidelity assessment |
| --- | --- |
| Overall hierarchy | The implementation combines the overview and detail concepts into one workspace: movement choices at the left, the largest preview in the center, three simple adjustment groups at the right, and inline teaching directly below the preview. The preview remains the dominant object. All three primary sections and export are visible in the header. No desktop control group overlaps another in the reviewed capture. |
| Typography | Persian uses the bundled Vazirmatn variable font, with a 15 px/1.8 base in the source. Headings, selected cards, and teaching text retain a clear weight hierarchy; English movement names are secondary. The implementation is more compact than the large presentation type of the concepts. The latest desktop raster is scaled, so apparent text sizes cannot be compared pixel-for-pixel. The shortened mobile movement subtitles fit their cards in the current capture. |
| Spacing and surfaces | The three-column arrangement, rounded panels, separated control groups, and generous central preview follow the references. The actual layout uses flatter panels and a smaller header. The preview controls and recording-unavailable notice have separate visible regions; the notice does not collide with the playback strip. The bottom teaching content continues below the captured viewport, rather than being compressed to imitate a single static artboard. |
| Color and state | The charcoal background, lighter gray panels, white primary type, muted helper text, and orange active states match the approved direction. Current source tokens are background `#101519`, panel `#191f24`, and accent `#f45b3c`. The selected Dolly card has an orange border, tinted surface, and selection mark, so its state has cues beyond color. The active navigation pill and selected simple-control options are distinct. |
| Icons and imagery | The local Tabler line icons replace the illustrated cameras, arrows, and large cinematic thumbnails in the concepts. The three-column product structure carries through; the illustrated richness does not. The fallback capture uses an orange schematic figure. The native WebGL capture uses the actual bundled low-poly character on the procedural street. Both differ substantially from the cinematic character and detailed street in the concepts. See the rendering distinction below. |
| Copy and teaching | The primary labels remain movement, frame/lens, and transitions. The opening action is a concrete choice: choose a movement, preview it, then adjust direction, duration, and motion feel. Definitions, a use case, and a short tip are shown close to the preview. Dolly and zoom are described as different operations. Framing copy says it adjusts the current movement's opening frame; beginner lens copy does not promise a fixed focal length during an authored zoom. Five starting movements include Orbit, which is present in the supplied Dolly-detail concept. |
| Progressive disclosure | Scene/model is a secondary entry, with export and help in dialogs. The full motion library and advanced controls are available without competing with the three primary learning sections. This is the agreed consolidation of the six concepts, rather than six separate top-level pages. |

### Rendered scene versus cinematic concept art

The approved images show a finished animated character, detailed architecture, lighting, and illustrative thumbnails. The existing offline engine uses a simplified stage and subject to explain camera geometry. The interactive cloud-browser session has **no WebGL**, so its screenshots show a **pre-recorded movement example**. The release CI uses Chromium with software WebGL and produces separate native screenshots of the actual live renderer.

The implementation visibly labels that state and states that changes are not applied to the recording. Source inspection confirms that the live-preview badge is hidden and framing guides are disabled in this mode. Scene/export preview mirrors are also labeled as recorded examples. These measures make the fallback understandable. Native CI evidence is identified separately below; the fallback screenshots do not show newly rendered settings. Cinematic character and environment fidelity is outside this interface change.

## Current mobile correction

The latest mobile capture was visually inspected after the header/width correction. Branding, export/help/settings, the three section tabs, the horizontal movement choices, and the camera preview remain inside the mobile column. The partially visible movement card and horizontal scrollbar belong to the intended scrollable choice row. No header action is visibly pushed out of the column.

Live DOM measurements reported by the implementation agent for that same correction:

| Measurement | Result |
| --- | --- |
| Iframe width | 390 px |
| Document client width, allowing the RTL scrollbar | 380 px |
| Header width | 380 px |
| Main stage width | 350 px |
| Section tab group width | 348 px |
| Brand width | 168.8 px |
| Header action group width | 159.7 px |

The header groups fit within the measured header bounds. This closes the observed mobile shell-width issue for the tested browser state. The final native-browser screenshots and release gate below confirm the same layout with live WebGL rendering.

## Interaction and implementation evidence

Evidence sources are kept distinct: the visual reviewer inspected the saved images and source; the implementation agent performed the live browser interactions. No live WebGL test is inferred from the fallback browser.

| Evidence source | Verified behavior |
| --- | --- |
| Live browser, reported by implementation agent | All three primary tabs; movement direction; framing choices; beginner lens choices; transition selection; scene, export, and help dialogs. The corrected mobile header and content bounds were measured in the browser. |
| DOM and source review | No duplicate HTML IDs or missing literal ID targets used by the studio scripts; tab `aria-controls` match their panels; script order and release asset inclusion are consistent. Native dialogs, tab focus handling, a skip link, and accessible control names are present. The previously identified English tab-direction mismatch is corrected by synchronizing `workspaceTabs.dir` with the active language. |
| Current framing function, evaluated against bundled path data | Pan, tilt, and zoom retain a stationary camera after Close framing. Moving-camera paths scale their motion. Reframing is non-cumulative; the current easing survives a later frame choice; subject position keys remain unchanged. The final stationary-camera correction also gives **0 m camera travel** for slow-motion, fast-motion, and speed-ramp. Geometry testing stopped after those targeted regressions passed. |
| Current beginner lens function, evaluated against bundled path data | **753 combinations** (251 authored paths × 24/50/85 mm choices) reach the requested opening focal length. The authored focal-length ratio is preserved for zoom paths. Changing the lens clears the active framing label because the crop changes. |
| Beginner content data review | All 19 teaching items have bilingual fields; 53 engine references resolve; related links and icon files exist. |
| Fallback source and capture | The recorded-example warning is visible. Guides and unsupported own-shot video export are disabled when live rendering is unavailable; the recorded learning clip and settings export remain distinct actions. |

## Desktop P0/P1 findings

**No new concrete desktop P0/P1 defect was identified in the latest movement capture.** There is no observed header overlap, clipped primary action, obscured playback control, or missing selected state in that captured view. This statement is limited to the reviewed state and does not classify unobserved renderer behavior as passing.

## Release sign-off

Final runtime commit: `dbb5a155fc6aa7efb3c5ebc3e56e5fcda0df7c7d` (version 0.8.1).

[Run 45708371126](https://github.com/iAlirezaaa/Director_Assisstant/actions/runs/45708371126) completed successfully, including build, real browser smoke tests and Pages deployment. Native preview artifact: `15067050886`; offline ZIP artifact: `15066641824`. The final native captures were inspected by the primary agent:

- `/workspace/scratch/c10a418ba7fc/qa-v0.8.1-dbb5a155/desktop-fa.png` — 1672 × 941
- `/workspace/scratch/c10a418ba7fc/qa-v0.8.1-dbb5a155/mobile-fa.png` — 390 × 844

The final captures show the actual rendered character facing the starting camera, a complete desktop header and control column, and a phone preview fitted to the content width. All typography, spacing, color, imagery and copy findings above were checked against this final composition. The renderer's low-poly visual style remains an explicit scope distinction from the cinematic concept art.

The public page was opened at `https://ialirezaaa.github.io/Director_Assisstant/studio.html?v=0.8.1`; its visible footer reported 0.8.1. Movement and frame/lens sections were exercised, the options menu was visually inspected, and clicking its offline link successfully downloaded the package from `https://ialirezaaa.github.io/Director_Assisstant/CameraAtlas-Offline.zip`. The public browser session uses the correctly labeled recorded fallback because its environment lacks WebGL; actual WebGL and own-shot video export were verified in CI.

### Issue closure

| Priority | Observed issue | Correction and final evidence |
| --- | --- | --- |
| P1 | Phone preview shrank below the available content width; header actions could extend outside the track. | Stretched flattened layout children, tightened the mobile header and shortened motion labels. Live DOM bounds, native 390px capture and automated viewport-bound checks pass. |
| P1 | Framing could change stationary pan/tilt behavior or lose the current easing. | Shared fixed pivot for stationary cameras; current timing copied to the framing base. Targeted data checks and browser regression gate pass. |
| P2 | Desktop preview heading consumed extra vertical space and pushed teaching too low. | Integrated desktop title/view controls into the preview and refined type hierarchy; final 1672px capture reviewed. |
| P2 | Starter character faced away from the opening camera, weakening face-framing lessons. | Default person-a subject yaw is180 degrees. Final native desktop/phone captures show the face. |
| P2 | Initial catalog-count assertion still assumed the advanced catalog was visible at startup. | Check the path data at startup; check the visible label after opening the catalog through its UI. Full gate passes. |

No P0 issue was found. No P1 issue remains open in the reviewed interface scope.

## Native runtime review and final correction

The primary agent inspected the approved Dolly reference and native 0.8.0 desktop screenshot together in one tool input, followed by the native 390 × 844 phone screenshot. Source design: 1672 × 941; native desktop capture: 1672 × 941. The center preview, choice list, controls, typography, selected states and teaching card are readable and do not overlap. The phone header and preview span the intended width; the motion row scrolls horizontally within its own panel.

The initial native render revealed that the bundled starter character faced away from the initial camera. Because close-up teaching refers to the face, version 0.8.1 gives newly added person-a subjects a 180-degree yaw. Existing saved instance transforms remain as saved. The same release gate passed for the final revision, and the updated native images visibly confirm its direction. No cinematic asset parity is claimed.

Successful 0.8.0 runtime evidence: [run 45707747840](https://github.com/iAlirezaaa/Director_Assisstant/actions/runs/45707747840), commit ccc7a25011ae6c98bd7e350e1f14418091ab7eb5. Native captures:

- `/workspace/scratch/c10a418ba7fc/qa-v0.8.0-ccc7a250/desktop-fa.png`
- `/workspace/scratch/c10a418ba7fc/qa-v0.8.0-ccc7a250/mobile-fa.png`

The gate passed actual nonblank WebGL pixels, all transition shader branches, beginner and advanced interaction flows, stationary pan/tilt framing and easing preservation, all 251 local clips and 17 model hashes, import/export data, native-dialog keyboard focus, RTL navigation, responsive bounds, and a downloaded one-second MediaRecorder video with a valid container signature. MediaRecorder was available and its test was not skipped. The gate also asserts no app page exceptions or local asset HTTP errors.
