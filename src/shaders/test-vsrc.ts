export default 
`
precision mediump float;

attribute vec3 a_position;

uniform vec4 u_color;
uniform float u_time;

void main () {
  gl_Position = vec4(a_position, 1.0);
}
`
