<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { refreshOutline, addOutline, removeOutline } from 'ionicons/icons'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const props = defineProps<{ src: string; name: string }>()
const host = ref<HTMLDivElement>()
const loading = ref(true)
const error = ref('')
const percent = ref(0)
let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let controls: OrbitControls | undefined
let observer: ResizeObserver | undefined
let environment: THREE.WebGLRenderTarget | undefined
let disposed = false
let distance = 6

function disposeModel(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>()
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value)
      }
      material.dispose()
    }
  })
  textures.forEach((texture) => {
    texture.dispose()
    const image = texture.source?.data
    if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) image.close()
  })
}
function reset() {
  if (!camera || !controls) return
  camera.position.set(distance * 0.75, distance * 0.4, distance * 0.85)
  controls.target.set(0, 0.65, 0)
  controls.update()
}
function zoom(factor: number) {
  if (!camera || !controls) return
  const offset = camera.position.clone().sub(controls.target)
  offset.setLength(
    THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance),
  )
  camera.position.copy(controls.target).add(offset)
  controls.update()
}
function keyboard(event: KeyboardEvent) {
  if (!camera || !controls) return
  if (event.key === '+' || event.key === '=') zoom(0.8)
  else if (event.key === '-') zoom(1.25)
  else if (event.key.toLowerCase() === 'r') reset()
  else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    const spherical = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(controls.target),
    )
    if (event.key === 'ArrowLeft') spherical.theta -= 0.15
    if (event.key === 'ArrowRight') spherical.theta += 0.15
    if (event.key === 'ArrowUp') spherical.phi -= 0.1
    if (event.key === 'ArrowDown') spherical.phi += 0.1
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.15, Math.PI / 2 - 0.04)
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical))
    controls.update()
  } else return
  event.preventDefault()
}
onMounted(async () => {
  try {
    if (!host.value) return
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    host.value.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-label', `${props.name} interactive 3D model`)
    renderer.domElement.setAttribute('role', 'img')
    renderer.domElement.tabIndex = 0
    scene = new THREE.Scene()
    scene.background = new THREE.Color('#f2f4f3')
    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    environment = pmrem.fromScene(room)
    scene.environment = environment.texture
    room.dispose()
    pmrem.dispose()
    camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableDamping = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    controls.maxPolarAngle = Math.PI / 2 - 0.04
    controls.minPolarAngle = 0.15
    controls.addEventListener('change', render)
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    observer = new ResizeObserver(() => {
      if (!host.value || !renderer || !camera) return
      const { width, height } = host.value.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      render()
    })
    observer.observe(host.value)
    const gltf = await new GLTFLoader().loadAsync(props.src, (event) => {
      if (event.total) percent.value = Math.round((event.loaded / event.total) * 100)
    })
    if (disposed) {
      disposeModel(gltf.scene)
      return
    }
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const extent = Math.max(size.x, size.y, size.z)
    if (!Number.isFinite(extent) || extent <= 0) throw new Error('Empty model')
    model.scale.multiplyScalar(4 / extent)
    box.setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z))
    scene.add(model)
    // Fit the bounding sphere to the narrower camera dimension, including mobile portrait.
    const vertical = THREE.MathUtils.degToRad(camera.fov / 2)
    const horizontal = Math.atan(Math.tan(vertical) * camera.aspect)
    distance = 2.25 / Math.sin(Math.min(vertical, horizontal)) / 1.2
    controls.minDistance = 3
    controls.maxDistance = distance * 2.5
    reset()
    loading.value = false
    renderer.setAnimationLoop(() => {
      if (!host.value?.getClientRects().length || document.hidden) return
      controls?.update()
      render()
    })
  } catch {
    if (!disposed) {
      error.value = 'The 3D view could not load. Please try again or return to photos.'
      loading.value = false
    }
  }
})
function render() {
  if (renderer && scene && camera && !disposed) renderer.render(scene, camera)
}
function contextLost(event: Event) {
  event.preventDefault()
  error.value = 'The 3D view was interrupted. Please reload the view.'
  renderer?.setAnimationLoop(null)
}
onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  controls?.dispose()
  renderer?.setAnimationLoop(null)
  renderer?.domElement.removeEventListener('webglcontextlost', contextLost)
  if (scene) disposeModel(scene)
  environment?.dispose()
  renderer?.dispose()
  renderer?.forceContextLoss()
})
</script>
<template>
  <div class="vehicle-3d" @keydown="keyboard">
    <div ref="host" class="vehicle-3d-canvas" />
    <div v-if="loading || error" class="vehicle-3d-status" role="status">
      <span>{{ error || `Loading 3D model${percent ? ` · ${percent}%` : '...'}` }}</span>
    </div>
    <div v-if="!loading && !error" class="vehicle-3d-tools">
      <button class="icon-button" aria-label="Zoom in" title="Zoom in" @click="zoom(0.8)">
        <ion-icon :icon="addOutline" />
      </button>
      <button class="icon-button" aria-label="Zoom out" title="Zoom out" @click="zoom(1.25)">
        <ion-icon :icon="removeOutline" />
      </button>
      <button class="icon-button" aria-label="Reset 3D view" title="Reset view" @click="reset">
        <ion-icon :icon="refreshOutline" />
      </button>
    </div>
  </div>
</template>
<style scoped>
.vehicle-3d {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 340px;
  background: #f2f4f3;
}
.vehicle-3d-canvas {
  position: absolute;
  inset: 0;
}
.vehicle-3d-canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
.vehicle-3d-status {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 28px;
  text-align: center;
  background: #f2f4f3;
}
.vehicle-3d-tools {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  gap: 8px;
}
.vehicle-3d-tools .icon-button {
  background: white;
}
</style>
