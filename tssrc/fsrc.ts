export default
`
precision mediump float; 

uniform float u_time; 

varying vec4 color;

void main () { 
  vec4 t_color = vec4(color);

  t_color[0] = sin(u_time / 1000.0);
  gl_FragColor = t_color; 
}
`
