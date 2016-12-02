export default
`
precision mediump float;

attribute vec3 a_coord; 
attribute vec3 a_normal;

uniform vec3 u_light;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

const vec4 COLOR_SCALE = vec4(256.0, 256.0, 256.0, 1.0);
const vec4 rgba = vec4(0.0, 255.0, 255.0, 1.0);
const vec4 color = rgba / COLOR_SCALE;

varying vec4 v_color;

void main () { 
  mat4 MVP = u_projection * u_view * u_model;
  mat4 MV = u_view * u_model;
  vec3 MVVertex = vec3(MV * vec4(a_coord, 1.0));
  vec3 MVNormal = vec3(MV * vec4(a_normal, 0.0));
  vec3 light_vector = normalize(u_light - MVVertex);
  float distance = length(u_light - MVVertex);
  float falloff = 0.05;
  float attenuation = 1.0 / (1.0 + (falloff * distance * distance));
  float diffuse = max(dot(MVNormal, light_vector), 0.1) * attenuation;

  v_color = vec4(color[0] * diffuse, color[1] * diffuse, color[2] * diffuse, color[3]);
  gl_Position = MVP * vec4(a_coord, 1.0);
}
`
