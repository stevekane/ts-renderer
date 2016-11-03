import { IGeometry } from './Geometry'

export interface IMesh {
  geometry: IGeometry
  program: WebGLProgram
  uniforms: {
    u_time: WebGLUniformLocation,
    u_light: WebGLUniformLocation,
    u_model: WebGLUniformLocation,
    u_view: WebGLUniformLocation,
    u_projection: WebGLUniformLocation
  }
  attributes: {
    a_coord: number
    a_normal: number
  }
}
