export default
`
precision mediump float;

attribute vec3 a_coord; 

uniform float u_time;
uniform vec3 u_position;
uniform vec3 u_scale;
uniform vec3 u_rotation;
uniform mat4 u_view;
uniform mat4 u_projection;

mat4 translate_from (vec3 v) {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    v.x, v.y, v.z, 1.0);
}

mat4 scale_from (vec3 v) {
  return mat4(
    v.x, 0.0, 0.0, 0.0,
    0.0, v.y, 0.0, 0.0,
    0.0, 0.0, v.z, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 rotation_about_x (float zRad) {
  float CS = cos(zRad);
  float SN = sin(zRad);

  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, CS,  -SN, 0.0,
    0.0, SN,  CS,  0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 rotation_about_y (float zRad) {
  float CS = cos(zRad);
  float SN = sin(zRad);

  return mat4(
    CS,  0.0, SN,  0.0,
    0.0, 1.0, 0.0, 0.0,
    -SN, 0.0, CS,  0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 rotation_about_z (float zRad) {
  float CS = cos(zRad);
  float SN = sin(zRad);

  return mat4(
    CS,  -SN, 0.0, 0.0,
    SN,  CS,  0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 model_mat (vec3 pos, vec3 scale, vec3 rot) {
  return translate_from(pos) *
         scale_from(scale) *
         rotation_about_x(rot.x) *
         rotation_about_z(rot.z) *
         rotation_about_y(rot.y);
}

void main () { 
  gl_Position 
    = u_projection 
    * u_view 
    * model_mat(u_position, u_scale, u_rotation)
    * vec4(a_coord, 1.0); 
}
`
