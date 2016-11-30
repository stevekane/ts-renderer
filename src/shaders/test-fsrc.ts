export default
`
precision mediump float;

uniform vec4 u_color;
uniform float u_time;

void main () {
  float t = ( sin(u_time / 1000.0) + 1.0 ) * 0.5;

  gl_FragColor = vec4(u_color[0], u_color[1], u_color[2], t);
}
`
