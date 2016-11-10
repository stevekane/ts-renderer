import { Either, fmap, flatMap, Success, Failure, unit } from './Either'

type GL = WebGLRenderingContext

export type Shader = Either<WebGLShader>
export type Program = Either<WebGLProgram>
export type Result = Either<Command>
export type UniformLocs = Either<Block<WebGLUniformLocation>>
export type Block<T> = { [ name: string ]: T }
export type ShaderSrc = string
export type ATTRIBUTE_SIZE = 1 | 2 | 3 | 4
export enum GL_TYPE { BYTE, U_BYTE, SHORT, U_SHORT, FLOAT }

export type Uniform
  = { type: '1f', val: number }
  | { type: '2f', x: number, y: number }
  | { type: '3f', x: number, y: number, z: number }
  | { type: '4f', x: number, y: number, z: number, w: number }
  | { type: 'matrix1fv', buffer: ArrayLike<number> }
  | { type: 'matrix2fv', buffer: ArrayLike<number> }
  | { type: 'matrix3fv', buffer: ArrayLike<number> }
  | { type: 'matrix4fv', buffer: ArrayLike<number> }

export type Attribute = { 
  buffer: ArrayLike<number>
  glType: GL_TYPE, 
  size: ATTRIBUTE_SIZE,
  offset?: number,
  stride?: number,
}

export interface Config {
  vsrc: ShaderSrc
  fsrc: ShaderSrc
  uniforms: Block<Uniform> 
  attributes: Block<Attribute>
}

// TODO: making these all more strictly type-safe with missing Mapped-types
export interface Command {
  program: WebGLProgram

  uniforms: Block<Uniform>
  uniformLocations: Block<WebGLUniformLocation>

  // attributes: Block<Attribute>
  // attributeLocations: Block<number>

  // buffers: Block<WebGLBuffer>
}

export function createCommand<I extends Config> (gl: GL, { vsrc, fsrc, uniforms }: I): Result {
  const p = fromSource(gl, vsrc, fsrc)
  const u = setupUniforms(gl, uniforms)

  return p.success && u.success
    ? new Success({ program: p.value, uniforms, uniformLocations: u.value })
    : new Failure('No')
}

function setupUniforms (gl: GL, uniforms: Block<Uniform>): UniformLocs {
  return new Success({} as Block<WebGLUniformLocation>)
}

function compileShader (gl: GL, kind: number, src: string): Shader {
  const shader = gl.createShader(kind)
  const kindStr = kind === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'

  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader && gl.getShaderParameter(shader, gl.COMPILE_STATUS) 
    ? new Success(shader) 
    : new Failure(`${ kindStr }: ${ gl.getShaderInfoLog(shader) || '' }`)
}

function linkProgram (gl: GL, vertex: WebGLShader, fragment: WebGLShader): Program {
  const program = gl.createProgram()

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  return program && gl.getProgramParameter(program, gl.LINK_STATUS) 
    ? new Success(program) 
    : new Failure(gl.getProgramInfoLog(program) || '')
}

function fromSource (gl: GL, vsrc: string, fsrc: string): Program {
  return flatMap(compileShader(gl, gl.VERTEX_SHADER, vsrc),   vertex =>
         flatMap(compileShader(gl, gl.FRAGMENT_SHADER, fsrc), fragment =>
         linkProgram(gl, vertex, fragment))) as Program
}
