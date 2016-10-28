export interface IGeometry {
  indices: Uint16Array
  vertices: Float32Array
  normals: Float32Array
}

export class Triangle implements IGeometry {
  indices = new Uint16Array([ 0, 1, 2 ])
  vertices = new Float32Array([ 
    0, -1, 0, 
    1, 1, 0, 
    -1, 1, 0 
  ])
  normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1
  ])
}
