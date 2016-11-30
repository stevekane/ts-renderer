export default
`
precision mediump float;

uniform vec4 u_color;
uniform float u_time;

void main () {
  gl_FragColor = vec4(u_color[0], u_color[1], u_color[2], sin(u_time));
}
`
