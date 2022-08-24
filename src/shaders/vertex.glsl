uniform float time;

void main() {
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
