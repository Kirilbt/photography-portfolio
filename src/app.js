import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from 'lil-gui'
import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'
import testTexture from './textures/test.jpg'

export default class Sketch {
  constructor(options) {
    this.container = options.domElement
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera( 30, this.width / this.height, 10, 1000 )
    this.camera.position.z = 600
    this.camera.fov = 2*Math.atan((this.height/2)/600) * 180 / Math.PI

    this.renderer = new THREE.WebGLRenderer({
      alpha: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.time = 0


    this.setupSettings()
    this.resize()
    this.addObjects()
    this.render()
    this.setupResize()
  }

  setupSettings() {
    this.settings = {
      progress: 0
    }

    this.gui = new GUI()
    this.gui.add( this.settings, 'progress', 0, 1, 0.001)
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize( this.width, this.height )
    this.camera.aspect = this.width/this.height
    this.camera.updateProjectionMatrix()
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  addObjects() {
    this.geometry = new THREE.PlaneGeometry( 300, 300, 100, 100 )

    this.material = new THREE.ShaderMaterial({
      wireframe: false,
      uniforms: {
        time: {value: 1.0},
        uProgress: {value: 1.0},
        uTexture: {value: new THREE.TextureLoader().load(testTexture)},
        uResolution: {value: new THREE.Vector2(this.width, this.height)},
        uQuadSize: {value: new THREE.Vector2(300, 300)}
      },

      vertexShader: vertex,
	    fragmentShader: fragment,
    })

    this.cube = new THREE.Mesh( this.geometry, this.material )
    this.scene.add( this.cube )
    this.cube.position.x = 300
    this.cube.rotation.x = 0.5
  }

  render() {
    this.time += 0.05
    this.material.uniforms.time.value = this.time
    this.material.uniforms.uProgress.value = this.settings.progress

    // this.cube.rotation.x += 0.01
    // this.cube.rotation.y += 0.01

    this.renderer.render( this.scene, this.camera )

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  domElement: document.getElementById('container')
})
