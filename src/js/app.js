import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from 'lil-gui'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'
import testTexture from '../img/test.jpg'

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
        uTime: {value: 1.0},
        uProgress: {value: 0},
        uTexture: {value: new THREE.TextureLoader().load(testTexture)},
        uTextureSize: {value: new THREE.Vector2(100, 100)},
        uResolution: {value: new THREE.Vector2(this.width, this.height)},
        uQuadSize: {value: new THREE.Vector2(300, 300)},
        uCorners: {value: new THREE.Vector4(0, 0, 0, 0)}
      },

      vertexShader: vertex,
	    fragmentShader: fragment,
    })

    this.tl = gsap.timeline()
      .to(this.material.uniforms.uCorners.value, {
        x: 1,
        duration: 1
      }, 0)
      .to(this.material.uniforms.uCorners.value, {
        y: 1,
        duration: 1
      }, 0.1)
      .to(this.material.uniforms.uCorners.value, {
        z: 1,
        duration: 1
      }, 0.2)
      .to(this.material.uniforms.uCorners.value, {
        w: 1,
        duration: 1
      }, 0.3)

    this.cube = new THREE.Mesh( this.geometry, this.material )
    this.scene.add( this.cube )
    this.cube.position.x = 300
  }

  render() {
    this.time += 0.05
    this.material.uniforms.uTime.value = this.time
    this.material.uniforms.uProgress.value = this.settings.progress

    // this.tl.progress(this.settings.progress)

    // this.cube.rotation.x += 0.01
    // this.cube.rotation.y += 0.01

    this.renderer.render( this.scene, this.camera )

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  domElement: document.getElementById('container')
})

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(ScrollToPlugin)

let sections = gsap.utils.toArray(".section");
let images = gsap.utils.toArray('.image')
let links = gsap.utils.toArray('a')

/**
 * Counter
 */

let totalNum = sections.length
document.querySelector('.totalNum').innerHTML = totalNum

/**
 * GSAP
 */

// Change background color on scroll

gsap.utils.toArray(".section").map((elem) => {

  var bgColor = elem.getAttribute('data-color');

  let trigger = ScrollTrigger.create({
    trigger: elem,
    start: 'top 5%',
    end: 'bottom 5%',
    markers: false,
    onToggle() {
      gsap.to('body', {
        backgroundColor: bgColor,
        duration: '1.2'
      })

      // gsap.to('.title', {
      //   color: bgColor,
      //   duration: '1.2'
      // })
    }
  });

  return () => {
    bgColor = elem.getAttribute('data-color')
    if (trigger.isActive) {
      gsap.killTweensOf('body');
      gsap.set('body', {
        backgroundColor: bgColor
      })
    }
  }
});

// Immediate snap

function goToSection(i) {
  gsap.to(window, {
    scrollTo: { y: i * innerHeight, autoKill: false, ease: "Power3.easeInOut" },
    duration: 0.8
  })
  document.querySelector('.currentNum').innerHTML = i + 1
}

ScrollTrigger.defaults({
  markers: false
})

sections.forEach((section, i) => {
  const mainAnim = gsap.timeline({ paused: true })

  ScrollTrigger.create({
    trigger: section,
    onEnter: () => goToSection(i),
  })

  ScrollTrigger.create({
    trigger: section,
    start: "bottom bottom",
    onEnterBack: () => goToSection(i)
  })
})

/**
 * Card Mouse Hover
 */

// const animateDetails = (opacity, delay) => {
//   gsap.to('.details', {
//     opacity: opacity,
//     duration: 0.3,
//     delay: delay
//   })
// }

const animateTitle = (opacity) => {
  gsap.to('.title', {
    opacity: opacity,
    duration: 0.3,
  })
}

images.forEach((image, i) => {
  image.addEventListener("mouseenter", () => {
    gsap.to(image, {
      scale: 1.1,
      duration: 0.5,
      overwrite: true,
      onToggle: () => {
        // animateDetails(0, 0),
        animateTitle(0)
      }
    })
  })

  image.addEventListener("mouseleave", () => {
    gsap.to(images, {
      scale: 1,
      duration: 0.5,
      overwrite: true,
      onToggle: () => {
        // animateDetails(1, 0.2),
        animateTitle(1)
      }
    })
  })
})
