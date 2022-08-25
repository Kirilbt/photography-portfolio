import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import ASScroll from '@ashthornton/asscroll'
import fragment from './shaders/fragment.glsl'
import vertex from './shaders/vertex.glsl'
import testTexture from '../img/test.jpg'

gsap.registerPlugin(ScrollTrigger)
gsap.registerPlugin(ScrollToPlugin)

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
    this.sections = gsap.utils.toArray('.section');
    this.images = gsap.utils.toArray('.js-image')
    this.links = gsap.utils.toArray('a')

    this.setSmoothScroll()
    this.setScrollTrigger()
    this.setMouseHover()
    // this.setCounter()
    this.setupSettings()
    this.resize()
    this.addObjects()
    this.render()
    this.setupResize()
  }

  setupASScroll() {
    // https://github.com/ashthornton/asscroll
    const asscroll = new ASScroll({
      // ease: 0.5,
      disableRaf: true
    })

    gsap.ticker.add(asscroll.update)

    ScrollTrigger.defaults({
      scroller: asscroll.containerElement })


    ScrollTrigger.scrollerProxy(asscroll.containerElement, {
      scrollTop(value) {
        if (arguments.length) {
          asscroll.currentPos = value
          return
        }
        return asscroll.currentPos
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      fixedMarkers: true })


    asscroll.on("update", ScrollTrigger.update)
    ScrollTrigger.addEventListener("refresh", asscroll.resize)

    requestAnimationFrame(() => {
      asscroll.enable({
        newScrollElements: document.querySelectorAll(".gsap-marker-start, .gsap-marker-end, [asscroll]")
      })
    })
    return asscroll;
  }

  setSmoothScroll() {
    this.asscroll = this.setupASScroll()
  }

  setScrollTrigger() {

    // Change background color on scroll

    this.sections.map((elem) => {

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

    // // Immediate snap

    // function goToSection(i) {
    //   gsap.to(window, {
    //     scrollTo: { y: i * innerHeight, autoKill: false, ease: 'Power3.easeInOut' },
    //     duration: 0.8
    //   })
    //   document.querySelector('.currentNum').innerHTML = i + 1
    // }

    // this.sections.forEach((section, i) => {
    //   const mainAnim = gsap.timeline({ paused: true })

    //   ScrollTrigger.create({
    //     trigger: section,
    //     onEnter: () => goToSection(i),
    //   })

    //   ScrollTrigger.create({
    //     trigger: section,
    //     start: 'bottom bottom',
    //     onEnterBack: () => goToSection(i)
    //   })
    // })
  }

  setMouseHover() {
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

    this.images.forEach((image, i) => {
      image.addEventListener('mouseenter', () => {
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

      image.addEventListener('mouseleave', () => {
        gsap.to(image, {
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
  }

  setCounter() {
    let totalNum = this.sections.length
    document.querySelector('.totalNum').innerHTML = totalNum
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
    this.geometry = new THREE.PlaneGeometry( 1, 1, 100, 100 )
    this.material = new THREE.ShaderMaterial({
      // wireframe: true,
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

    this.mesh = new THREE.Mesh( this.geometry, this.material )
    this.mesh.position.x = 300
    this.mesh.scale.set(300, 300, 1)
    // this.scene.add( this.mesh )

    this.materials = []
    const loader = new THREE.TextureLoader()

    this.imageStore = this.images.map(img => {
      let bounds = img.getBoundingClientRect()
      let m = this.material.clone()
      this.materials.push(m)
      // let texture = new THREE.Texture(img)
      let texture = loader.load(img.src)
      // texture.needsUpdate = true

      m.uniforms.uTexture.value = texture

      let mesh = new THREE.Mesh(this.geometry, m)
      this.scene.add(mesh)
      mesh.scale.set(bounds.width, bounds.height, 1)

      return {
        img: img,
        mesh: mesh,
        width: bounds.width,
        height: bounds.height,
        top: bounds.top,
        left: bounds.left
      }
    })
  }

  setPosition() {
    console.log(this.asscroll.currentPos);
    this.imageStore.forEach(o =>{
      o.mesh.position.x = o.left - this.width/2 + o.width/2
      o.mesh.position.y = this.asscroll.currentPos + -o.top + this.height/2 - o.height/2
    })
  }

  render() {
    this.time += 0.05
    this.material.uniforms.uTime.value = this.time
    // this.material.uniforms.uProgress.value = this.settings.progress
    this.setPosition()
    this.tl.progress(this.settings.progress)

    // this.mesh.rotation.x += 0.01
    // this.mesh.rotation.y += 0.01

    this.renderer.render( this.scene, this.camera )

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({
  domElement: document.getElementById('container')
})
