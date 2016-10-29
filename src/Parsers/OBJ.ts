import { Parser, unit, flatMap, doThen, fmap } from './Parser'
import { 
  spaces, real, or, exactly, many, seperatedBy, atleastN, between, around,
  interspersing
} from './parsers'
import { isNumber, isAlpha, is } from './predicates'
import { IGeometry } from '../Rendering/Geometry'

/*
  What is a face?  It's a set of connected vertices which are combinations
  of up to three properties: 
    position
    tex_coord?
    normal?
  The actual values are not encoded here, but rather indices into the 
    v, vt, and vn arrays.

  OpenGL assumes you will be drawing everything by indices in an Elements Array
  which means that before you can feed this data to OpenGL, you must construct 
  parallel arrays ( or a single joined array ) that contains all the data 
  for every vertex.

  EG: Here is a plane which has three vertices all of whom share a single normal

  v -1.0 -1.0 0.0
  v 1.0  1.0  0.0
  v -1.0 1.0  0.0

  vn 0.0 0.0 1.0

  f 1 2 3

  we NEED something like the following:

  vertices = [ -1 -1  0    1  1  0   -1  1  0 ]
  normals =  [  0  0  1    0  0  1    0  0  1 ]

  which we got by iterating the faces in-order and filling arrays with data found
  at that index into the already-parsed vertex array:
*/

type V3 = [ number, number, number ]
type V4 = [ number, number, number, number ]

export interface IVertex   { kind: 'Vertex',   value: V4 }
export interface ITexCoord { kind: 'TexCoord', value: V3 }
export interface INormal   { kind: 'Normal',   value: V3 }
export interface IFace     { kind: 'Face',     value: V4 }
export interface IIgnored  { kind: 'Ignored' }

export const Vert = (x: number, y: number, z: number, w: number): IVertex => ({ 
  kind: 'Vertex', 
  value: [ x, y, z, w ]
})

export const TexCoord = (x: number, y: number, z: number): ITexCoord => ({ 
  kind: 'TexCoord', 
  value: [ x, y, z ]
})

export const Face = (x: number, y: number, z: number, w: number): IFace => ({ 
  kind: 'Face', 
  value: [ x, y, z, w ] 
})

export const Normal = (x: number, y: number, z: number): INormal => ({ 
  kind: 'Normal', 
  value: [ x, y, z ] 
})

export const Ignored = (): IIgnored => ({ kind: 'Ignored' })

export type Line
  = IVertex 
  | ITexCoord 
  | INormal
  | IFace
  | IIgnored

export const vertex: Parser<Line> =
  doThen(exactly('v'),
  flatMap(atleastN(3, doThen(spaces, real)), xs =>
  unit(Vert(Number(xs[0]), Number(xs[1]), Number(xs[2]), xs[3] ? Number(xs[3]) : 1.0))))

// const texCoord: Parser<OBJ> =
//   doThen(match('vt'),
//   flatMap(consumeThen(spaces, real),                u =>
//   flatMap(consumeThen(spaces, real),                v =>
//   flatMap(consumeThen(spaces, or(real, unit(1.0))), w =>
//   unit(TexCoord(u, v, w))))))
// 
// const normal: Parser<OBJ> =
//   doThen(match('vn'),
//   flatMap(consumeThen(spaces, real), x =>
//   flatMap(consumeThen(spaces, real), y =>
//   flatMap(consumeThen(spaces, real), z =>
//   unit(Normal(x, y, z))))))
// 
// 
// const face: Parser<OBJ> = 
//   doThen(match('f'), 
//   flatMap(many(match('1')), indices =>
//   doThen(match('\n'),
//   //unit(Face(indices[0], indices[1], indices[2], indices[3])))))
//   unit(Face(1, 2, 3, 4)))))
// 
// const ignored: Parser<OBJ> =
//   doThen(manyStr(ncr), 
//   doThen(cr,
//   unit(Ignored())))

// const line: Parser<OBJ> = 
//   doThen(spaces, 
//   or(vertex,
//   or(normal,
//   or(face,
//   or(ignored,
//   texCoord)))))
// 
// function linesToGeometry (lines: OBJ[]): IGeometry {
//   const vertices: number[] = []
//   const normals: number[] = []
//   const indices: number[] = []
// 
//   for ( const l of lines ) {
//     if      ( l.kind === 'Vertex' ) vertices.push(...l.value)
//     else if ( l.kind === 'Normal' ) normals.push(...l.value)
//     else if ( l.kind === 'Face' )   indices.push(...l.value.map(n => n - 1)) 
//     else {}
//   }
//   return { 
//     indices: new Uint16Array(indices),
//     vertices: new Float32Array(vertices),
//     normals: new Float32Array(normals)
//   }
// }
// 
// export const parseOBJ = fmap(linesToGeometry, many(line))
