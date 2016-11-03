import { IMesh } from './Mesh'

export interface IRenderable {
  mesh: IMesh
  position: Float32Array
  rotation: Float32Array
  scale: Float32Array
  model: Float32Array
  buffers: {
    a_coord: WebGLBuffer,
    a_normal: WebGLBuffer,
    a_texCoord: WebGLBuffer
  }
}
