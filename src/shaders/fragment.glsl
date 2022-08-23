uniform float time;
uniform sampler2D uTexture;

varying float pulse;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec4 myImage = texture(
    uTexture,
    vUv + 0.01*sin(vUv*20. + time)
  );
  float sinePulse = (1. + sin(vUv.x*50. + time))*0.5;
  gl_FragColor = myImage;
  gl_FragColor = vec4(0.5*(pulse+1.),0.,0.,1.);
}
