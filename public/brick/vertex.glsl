precision mediump float;

attribute vec3 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord;

uniform float u_time;
uniform sampler2D u_diffuse;

varying vec4 v_color;
varying vec2 v_texCoord;

const float DELAY = 500.0;
const float MAGNITUDE = 0.2;

void main () {
  float x = a_position[0] + sin(u_time / DELAY) * MAGNITUDE;
  float y = a_position[1] + cos(u_time / DELAY) * MAGNITUDE;
  float z = a_position[2];

  v_color = a_color;
  v_texCoord = a_texCoord;
  gl_Position = vec4(x, y, z, 1.0);
}
