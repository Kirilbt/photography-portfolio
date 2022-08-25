uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uQuadSize;
uniform vec4 uCorners;

varying vec2 vUv;
varying vec2 vSize;

void main() {
  vUv = uv;
  float PI = 3.1415926;
  float sine = sin(PI*uProgress);
  float waves = sine*0.1*sin(5.*length(uv) + 15.*uProgress);
  vec4 defaultState = modelMatrix * vec4(position, 1.0);
  vec4 fullScreenState = vec4(position, 1.0);

  fullScreenState.x *= uResolution.x;
  fullScreenState.y *= uResolution.y;
  fullScreenState.z += uCorners.x;

  float cornersProgress = mix(
    mix(uCorners.z, uCorners.w, uv.x),
    mix(uCorners.x, uCorners.y, uv.x),
    uv.y
  );

  vec4 finaleState = mix(defaultState, fullScreenState, cornersProgress);

  vSize = mix(uQuadSize, uResolution, cornersProgress);

  gl_Position = projectionMatrix * viewMatrix * finaleState;
}
