import { Parser, unit, failed, flatMap, doThen, fmap } from './Parser'
import { 
  dash, slash, spaces, dot, real, integer, nums, newline, eof,
  or, orDefault, optional, anyOf, inRange, satisfy,
  exactly, match, many, manyTill, seperatedBy, atleastN, between, around, concat,
  interspersing
} from './parsers'
import { isNumber, isAlpha, is } from './predicates'
import { IGeometry } from '../Rendering/Geometry'

export type V3 = [ number, number, number ]
export type V4 = [ number, number, number, number ]
export interface IFaceVertex { v: number, vt?: number, vn?: number }

export interface IVertex   { kind: 'Vertex',   value: V4 }
export interface ITexCoord { kind: 'TexCoord', value: V3 }
export interface INormal   { kind: 'Normal',   value: V3 }
export interface IFace     { kind: 'Face',     value: IFaceVertex[] }
export interface IIgnored  { kind: 'Ignored' }

export const Vert = (x: number, y: number, z: number, w: number): IVertex => ({ 
  kind: 'Vertex', 
  value: [ x, y, z, w ]
})

export const TexCoord = (x: number, y: number, z: number): ITexCoord => ({ 
  kind: 'TexCoord', 
  value: [ x, y, z ]
})

export const Face = (indices: IFaceVertex[]): IFace => ({ 
  kind: 'Face', 
  value: indices
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

const txCoord = inRange(0, 1, real)
const term = or(eof, newline)
const anyChar = satisfy(_ => true)

const faceVertex =
  doThen(spaces,
  flatMap(integer,                                    v => 
  flatMap(optional(doThen(slash, optional(integer))), vt =>
  flatMap(optional(doThen(slash, integer)),           vn =>
  unit({ v, vt, vn })))))

export const vertex: Parser<Line> =
  doThen(exactly('v'),
  flatMap(doThen(spaces, real),                 x =>
  flatMap(doThen(spaces, real),                 y =>
  flatMap(doThen(spaces, real),                 z =>
  flatMap(doThen(spaces, orDefault(real, 1.0)), w =>
  doThen(term,
  unit(Vert(x, y, z, w))))))))

export const texCoord: Parser<Line> =
  doThen(match('vt'),
  flatMap(doThen(spaces, txCoord),                 u =>
  flatMap(doThen(spaces, txCoord),                 v =>
  flatMap(doThen(spaces, orDefault(txCoord, 0.0)), w =>
  doThen(term,
  unit(TexCoord(u, v, w)))))))

export const normal: Parser<Line> =
  doThen(match('vn'),
  flatMap(doThen(spaces, real), x =>
  flatMap(doThen(spaces, real), y =>
  flatMap(doThen(spaces, real), z =>
  doThen(term,
  unit(Normal(x, y, z)))))))

export const face: Parser<Line> = 
  doThen(match('f'), 
  flatMap(atleastN(3, doThen(spaces, faceVertex)), fvs =>
  doThen(term,
  unit(Face(fvs)))))

export const ignored: Parser<Line> =
  doThen(manyTill(anyChar, term),
  unit(Ignored()))

export const line: Parser<Line> = 
  anyOf([ vertex, texCoord, normal, face, ignored ])

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
