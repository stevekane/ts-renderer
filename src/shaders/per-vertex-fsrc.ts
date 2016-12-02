export default
`
precision mediump float; 

uniform vec3 u_position;
uniform vec3 u_scale;
uniform vec3 u_rotation;

varying vec4 v_color;

void main () { 
  gl_FragColor = v_color; 
}
`
