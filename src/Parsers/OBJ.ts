import { Parser, unit, flatMap, doThen, fmap } from './Parser'
import { satisfy, match } from './parsers'
import { many, manyStr, or, consumeThen, between, around, until } from './combinators'
import { isNumber } from './predicates'
import { IGeometry } from '../Rendering/Geometry'

const cr          = match('\n')
const dot         = match('.') 
const ncr         = satisfy(n => n !== '\n')
const space       = satisfy(n => n === ' ')
const non_space   = satisfy(n => n !== ' ')
const spaces      = manyStr(space)
const non_spaces  = manyStr(non_space)
const num         = satisfy(isNumber)
const non_num     = satisfy(n => !isNumber(n))

const left = 
  flatMap(or(match('-'), unit('')), pref =>
  flatMap(until(non_num, num),      digits =>
  unit(pref + digits.join(''))))

// const left = 
//   flatMap(or(match('-'), unit('')), pref =>
//   flatMap(manyStr(num),             digits =>
//   unit(pref + digits)))
const right = manyStr(num)
const integer = fmap(l => Number(l), left)
const real = fmap(([ l, r ]) => Number(l + '.' + r), around(left, dot, right))

console.log(integer('11'))
console.log(many(integer)('111'))
// console.log(many(consumeThen(spaces, real))('1.3 -1.05'))
// console.log(until(match('!'), dot)('....!'))
// console.log(until(cr, consumeThen(spaces, integer))('1 2 3 4\n'))

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

interface IVertex   { kind: 'Vertex',   value: V3 }
interface ITexCoord { kind: 'TexCoord', value: V3 }
interface INormal   { kind: 'Normal',   value: V3 }
interface IFace     { kind: 'Face',     value: V4 }
interface IIgnored  { kind: 'Ignored' }

const Vert = (x: number, y: number, z: number): IVertex => ({ 
  kind: 'Vertex', 
  value: [ x, y, z ]
})

const TexCoord = (x: number, y: number, z: number): ITexCoord => ({ 
  kind: 'TexCoord', 
  value: [ x, y, z ]
})

const Face = (x: number, y: number, z: number, w: number): IFace => ({ 
  kind: 'Face', 
  value: [ x, y, z, w ] 
})

const Normal = (x: number, y: number, z: number): INormal => ({ 
  kind: 'Normal', 
  value: [ x, y, z ] 
})

const Ignored = (): IIgnored => ({ kind: 'Ignored' })

type OBJ 
  = IVertex 
  | ITexCoord 
  | INormal
  | IFace
  | IIgnored

const vertex: Parser<OBJ> =
  doThen(match('v'),
  flatMap(consumeThen(spaces, real),                x =>
  flatMap(consumeThen(spaces, real),                y =>
  flatMap(consumeThen(spaces, real),                z =>
  flatMap(consumeThen(spaces, or(real, unit(1.0))), w =>
  unit(Vert(x, y, z)))))))

const texCoord: Parser<OBJ> =
  doThen(match('vt'),
  flatMap(consumeThen(spaces, real),                u =>
  flatMap(consumeThen(spaces, real),                v =>
  flatMap(consumeThen(spaces, or(real, unit(1.0))), w =>
  unit(TexCoord(u, v, w))))))

const normal: Parser<OBJ> =
  doThen(match('vn'),
  flatMap(consumeThen(spaces, real), x =>
  flatMap(consumeThen(spaces, real), y =>
  flatMap(consumeThen(spaces, real), z =>
  unit(Normal(x, y, z))))))


const face: Parser<OBJ> = 
  doThen(match('f'), 
  flatMap(many(match('1')), indices =>
  doThen(match('\n'),
  //unit(Face(indices[0], indices[1], indices[2], indices[3])))))
  unit(Face(1, 2, 3, 4)))))

const ignored: Parser<OBJ> =
  doThen(manyStr(ncr), 
  doThen(cr,
  unit(Ignored())))

const line: Parser<OBJ> = 
  doThen(spaces, 
  or(vertex,
  or(normal,
  or(face,
  or(ignored,
  texCoord)))))

function linesToGeometry (lines: OBJ[]): IGeometry {
  const vertices: number[] = []
  const normals: number[] = []
  const indices: number[] = []

  for ( const l of lines ) {
    if      ( l.kind === 'Vertex' ) vertices.push(...l.value)
    else if ( l.kind === 'Normal' ) normals.push(...l.value)
    else if ( l.kind === 'Face' )   indices.push(...l.value.map(n => n - 1)) 
    else {}
  }
  return { 
    indices: new Uint16Array(indices),
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals)
  }
}

export const parseOBJ = fmap(linesToGeometry, many(line))
