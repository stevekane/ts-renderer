import { GL, Program } from './GLTypes'

/*
  THOUGHTS ON INDEX / drawElements 

  Each command is either renderered with drawElements or drawArrays
  this should be determined by whether the cfg supplies an index attribute
  for the "index" property.  I think this is best separated from general
  attributes as it plays an important role in determining how the command
  will be used.  Furthermore, it also seems that there is no need for user
  customization for this property.  If they supply an Int16Array for the 
  index property, then the command will execute with drawElements
  and not drawArrays
*/

export type AttributeSize = 1 | 2 | 3 | 4
export enum BufferType { BYTE, UNSIGNED_BYTE, SHORT, UNSIGNED_SHORT, FLOAT }

export interface AttributeCfg<T> { 
  value: T
  readonly bufferType: BufferType
  size: AttributeSize
  offset?: number
  stride?: number
  set( gl: GL, a: Attribute<T>, t: T ): void
}

export interface Attribute<T> extends AttributeCfg<T> {
  loc: number
  buffer: WebGLBuffer
}

export type AttributeCfgs<T> = { [ P in keyof T ]: AttributeCfg<T[P]> }
export type Attributes<T> = { [ P in keyof T ]: Attribute<T[P]> }

export class Floats implements AttributeCfg<Float32Array> {
  offset = 0
  stride = 0
  readonly bufferType = BufferType.FLOAT
  constructor( public size: AttributeSize, public value: Float32Array ) {}
  set( gl: GL, a: Attribute<Float32Array>, value: Float32Array ) {
    const { loc, size, stride, offset, buffer } = a

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, value, gl.DYNAMIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
  }
}

export function setupAttribute<T> ( gl: GL, program: Program, name: string, acfg: AttributeCfg<T> ): Attribute<T> | Error {
  const { value, bufferType, size, set, offset = 0, stride = 0 } = acfg
  const loc = gl.getAttribLocation(program, name)
  const buffer = gl.createBuffer()

  if ( loc == null )    return new Error(`Could not locate attr: ${ name }`)
  if ( buffer == null ) return new Error(`Could not create buffer for attr: ${ name }`)

  const a = { value, bufferType, size, offset, stride, loc, buffer, set }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.vertexAttribPointer(loc, size, toGLType(gl, bufferType), false, stride, offset)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return (set(gl, a, value), { value, bufferType, size, offset, stride, loc, buffer, set })
}

function toGLType ( gl: GL, bufferType: BufferType ): number {
  switch ( bufferType ) {
    case BufferType.FLOAT:          return gl.FLOAT
    case BufferType.SHORT:          return gl.SHORT
    case BufferType.BYTE:           return gl.BYTE
    case BufferType.UNSIGNED_SHORT: return gl.UNSIGNED_SHORT
    case BufferType.UNSIGNED_BYTE:  return gl.UNSIGNED_BYTE
    default: const n: never = bufferType
             return n
  }
}
