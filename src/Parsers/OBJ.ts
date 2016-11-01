import { 
  Parser, unit, failed, fmap, apply, lift, lift3, lift4, flatMap, doThen 
} from './Parser'
import { 
  dash, slash, spaces, dot, real, integer, nums, newline, eof,
  or, orDefault, optional, anyOf, inRange, satisfy,
  exactly, match, many1, many, atleastN,
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

const spaced = <A> (p: Parser<A>): Parser<A> => doThen(spaces, p)
const txCoord = inRange(0, 1, real)
const anyChar = satisfy(_ => true)

const faceVertex =
  lift3((v, vt, vn) => ({ v, vt, vn }),
  spaced(integer),
  optional(doThen(slash, optional(integer))),
  optional(doThen(slash, integer)))

export const vertex: Parser<Line> =
  lift4(Vert, 
        doThen(exactly('v'), spaced(real)), 
        spaced(real), 
        spaced(real), 
        spaced(orDefault(real, 1.0)))

export const texCoord: Parser<Line> =
  lift3(TexCoord,
        doThen(match('vt'), spaced(txCoord)),
        spaced(txCoord),
        spaced(orDefault(txCoord, 0.0)))

export const normal: Parser<Line> =
  lift3(Normal,
        doThen(match('vn'), spaced(real)),
        spaced(real),
        spaced(real))

export const face: Parser<Line> = 
  lift(Face, 
       doThen(match('f'), atleastN(3, spaced(faceVertex))))

export const ignored: Parser<Line> =
  doThen(many1(anyChar),
  unit(Ignored()))

export const line: Parser<Line> = 
  anyOf([ vertex, texCoord, normal, face, ignored ])

function linesToGeometry (lines: Line[]): IGeometry {
  const pVertices: V4[] = []
  const pNormals: V3[] = []
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []

  for ( const l of lines ) {
    if      ( l.kind === 'Vertex' ) pVertices.push(l.value)
    else if ( l.kind === 'Normal' ) pNormals.push(l.value)
    else if ( l.kind === 'Face' ) {
      for ( const fv of l.value ) {
        vertices.push(...pVertices[fv.v - 1])
        normals.push(...(fv.vn != null ? pNormals[fv.vn - 1] : [ 0, 0, 1 ]))
        indices.push(fv.v - 1)
      }
    }
    else {}
  }
  
  return { 
    indices: new Uint16Array(indices),
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals)
  }
}

export const parseOBJ = 
  fmap(linesToGeometry, interspersing(line, many(newline)))
