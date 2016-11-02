import { IGeometry } from './Geometry'

export interface IMesh {
  geometry: IGeometry
  program: WebGLProgram
  uniforms: {
    u_time: WebGLUniformLocation,
    u_position: WebGLUniformLocation,
    u_scale: WebGLUniformLocation, 
    u_rotation: WebGLUniformLocation,
    u_view: WebGLUniformLocation
    u_projection: WebGLUniformLocation
  }
  attributes: {
    a_coord: number
  }
}
