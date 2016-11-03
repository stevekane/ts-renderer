export default
`
precision mediump float;

attribute vec3 a_coord; 
attribute vec3 a_normal;

uniform float u_time;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main () { 
  mat4 MVP = u_projection * u_view * u_model;
  mat4 MV = u_view * u_model;

  gl_Position = MVP * vec4(a_coord, 1.0);
}
`
