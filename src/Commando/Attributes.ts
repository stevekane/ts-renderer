import { GL, Program } from './GLTypes'

export type AttributeType
  = Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Float32Array
export type AttributeSize = 1 | 2 | 3 | 4 

export interface AttributeCfg { 
  value: AttributeType
  size: AttributeSize
  offset?: number
  stride?: number
}

export interface Attribute extends AttributeCfg {
  loc: number
  buffer: WebGLBuffer
}

export type AttributeCfgs<T> = { [ P in keyof T ]: AttributeCfg }
export type Attributes<T> = { [ P in keyof T ]: Attribute }

export function setupAttribute ( gl: GL, program: Program, name: string, acfg: AttributeCfg ): Attribute | Error {
  const { value, size, offset = 0, stride = 0 } = acfg
  const loc = gl.getAttribLocation(program, name)
  const buffer = gl.createBuffer()
  const glType = glTypeFor(gl, value)

  if ( loc == null )    return new Error(`Could not locate attr: ${ name }`)
  if ( buffer == null ) return new Error(`Could not create buffer for attr: ${ name }`)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, size, glType, false, stride, offset)
  gl.bufferData(gl.ARRAY_BUFFER, value, gl.DYNAMIC_DRAW)
  gl.disableVertexAttribArray(loc)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  return { value, size, offset, stride, loc, buffer }
}

function glTypeFor ( gl: GL, v: AttributeType ): number {
  if      ( v instanceof Float32Array ) return gl.FLOAT
  else if ( v instanceof Int16Array )   return gl.SHORT
  else if ( v instanceof Uint16Array )  return gl.UNSIGNED_SHORT
  else if ( v instanceof Int8Array )    return gl.BYTE
  else                                  return gl.UNSIGNED_BYTE
}
