export default
`
precision mediump float; 

uniform float u_time;
uniform vec3 u_position;
uniform vec3 u_scale;
uniform vec3 u_rotation;

const vec4 color = vec4(1.0, 0.5, 0.25, 1.0);

void main () { 
  vec4 t_color = vec4(color);

  t_color[0] = sin(u_time / 1000.0);
  gl_FragColor = t_color; 
}
`
