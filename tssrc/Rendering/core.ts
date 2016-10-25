import { IMesh } from './Mesh'

export interface IRenderable {
  mesh: IMesh
  position: Float32Array
  rotation: Float32Array
  scale: Float32Array
}

// TODO: Probably should be generic?
export interface IProgram {
  attributes: IAttributes
  uniforms: IUniforms
  buffers: IBuffers
}

interface IAttributes {
  a_coord: number
  a_color: number
}

interface IUniforms {
  u_position: WebGLUniformLocation | null
  u_scale: WebGLUniformLocation | null
  u_rotation: WebGLUniformLocation | null
}

interface IBuffers {
  vertices: WebGLBuffer | null
  normals: WebGLBuffer | null
  colors: WebGLBuffer | null
  indices: WebGLBuffer | null
}
