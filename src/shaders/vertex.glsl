uniform float time;
varying float pulse;

void main() {
  vec3 newPosition = position;
  newPosition.z = 0.1*sin(length(position)*30. + time);
  pulse = 20.*newPosition.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
