# Vehicle 3D assets

The commuter viewer uses Three.js, GLTFLoader and OrbitControls. Models are loaded
only when a visitor chooses 3D view. Photo browsing does not download a model.

## Included asset

- Tesla 2018 Model 3 by Ameer Studio.
- Original: https://sketchfab.com/3d-models/tesla-2018-model-3-5ef9b845aaf44203b6d04e2c677e444f
- License: https://creativecommons.org/licenses/by/4.0/
- Download mirror: https://github.com/jamesalmeida/tesla-infotainment/blob/main/public/car-models/tesla-model-3-2018.glb
- Asset author and CC BY 4.0 license verified against Sketchfab API and embedded GLB metadata.
- Binary unchanged. Runtime scale/centering and studio lighting applied for viewing.
- This is a 2018 reference model, not a guaranteed match for the actual rental trim/year.
- This asset is not AI-generated. Attribution is displayed below the viewer.

## Future generated assets

Each Car has an optional model3d record with a URL, description and provenance.
An approved AI-generated GLB can use this same viewer. Keep its description clear
that appearance is approximate; retain source/provenance and service terms.

No admin UI, generation service, credentials or backend is implemented here.
Automatic photo conversion requires a server-side provider integration, job status,
storage, input consent and review before publication. Never put provider secrets in
VITE environment variables. Missing models continue to use photos; do not substitute
unrelated geometry or a spinning flat photograph.
