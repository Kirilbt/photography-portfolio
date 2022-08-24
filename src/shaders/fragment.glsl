uniform float time;
uniform float uProgress;
uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
  vec4 image = texture(uTexture, vUv);
  gl_FragColor = image;
}
