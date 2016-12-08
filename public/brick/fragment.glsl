precision mediump float;

uniform float u_time;
uniform sampler2D u_diffuse;

varying vec4 v_color;
varying vec2 v_texCoord;

void main () {
  gl_FragColor = texture2D(u_diffuse, v_texCoord);
}
