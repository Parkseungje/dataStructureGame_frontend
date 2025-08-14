<template>
  <div ref="container" class="three-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'

const container = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let animationId = 0

onMounted(() => {
  if (!container.value) return

  // 1) Renderer: 가벼운 옵션
  renderer = new THREE.WebGLRenderer({
    antialias: false,                 // ✨ 끄면 체감 좋아짐
    powerPreference: 'high-performance',
    alpha: false,
    stencil: false,
    depth: true
  })
  // Retina에서 과도한 픽셀수 제한 (1.5~2 사이 권장)
  const targetPR = Math.min(window.devicePixelRatio || 1, 1.75)
  renderer.setPixelRatio(targetPR)
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  // 무거운 기능 끄기
  renderer.shadowMap.enabled = false
  renderer.toneMapping = THREE.NoToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace

  container.value.appendChild(renderer.domElement)

  // 2) Scene/Camera(라이트/재질 가볍게)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
      70,
      container.value.clientWidth / container.value.clientHeight,
      0.1,
      1000
  )
  camera.position.z = 5

  // 라이트 없이도 보이는 MeshNormalMaterial/BasicMaterial 사용
  const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial() // or MeshBasicMaterial({color: 0x22ccff})
  )
  scene.add(cube)

  // 3) 애니메이션: delta 기반 + 탭 숨김 시 일시정지
  let last = performance.now()
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    const now = performance.now()
    const dt = Math.min((now - last) / 1000, 0.05) // 50ms clamp
    last = now

    cube.rotation.x += 1.0 * dt
    cube.rotation.y += 1.2 * dt

    renderer!.render(scene, camera)
  }

  const onVisibility = () => {
    if (!renderer) return
    if (document.hidden) {
      cancelAnimationFrame(animationId)
    } else {
      last = performance.now()
      animate()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)
  animate()

  // 4) Resize 핸들러
  const onResize = () => {
    if (!container.value || !renderer) return
    const w = container.value.clientWidth
    const h = container.value.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('resize', onResize)
    cancelAnimationFrame(animationId)
    if (renderer) {
      renderer.dispose()
      const canvas = renderer.domElement
      canvas.parentElement?.removeChild(canvas)
      renderer = null
    }
    // geometry/material도 필요시 dispose 해주세요.
    cube.geometry.dispose()
    ;(cube.material as THREE.Material).dispose()
  })
})
</script>

<style scoped>
.three-container { width: 100%; height: 100vh; background: #000; }
:deep(canvas) { display: block; }
</style>
