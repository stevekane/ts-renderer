export default
`
attribute vec3 a_coord; 
attribute vec4 a_color;

uniform vec3 u_position;
uniform vec3 u_scale;
uniform vec3 u_rotation;

varying vec4 color;

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

void main () { 
  mat4 trans = translate_from(u_position);
  mat4 scale = scale_from(u_scale);
  mat4 rot_x = rotation_about_x(u_rotation[0]);
  mat4 rot_y = rotation_about_y(u_rotation[1]);
  mat4 rot_z = rotation_about_z(u_rotation[2]);
  vec4 pos = vec4(a_coord, 1.0);

  color = a_color;
  gl_Position = trans * scale * rot_y * rot_z * rot_x * pos; 
}
`
