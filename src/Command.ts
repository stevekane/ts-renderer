import { Either, fmap, flatMap, Success, Failure, unit } from './Either'

type GL = WebGLRenderingContext

export type Shader = Either<WebGLShader>
export type Program = Either<WebGLProgram>
export type Result = Either<Command>
export type ActiveUniforms = Either<Block<WebGLUniformLocation>>
export type ActiveAttributes = Either<Block<ActiveAttribute>>
export type Block<T> = { [ name: string ]: T }
export type ShaderSrc = string
export type ATTRIBUTE_SIZE = 1 | 2 | 3 | 4
export enum ATTRIBUTE_TYPE { BYTE, U_BYTE, SHORT, U_SHORT, FLOAT }
export enum UNIFORM_TYPE {
  f1 = 0,     f2,         f3,         f4,
  i1,         i2,         i3,         i4,
  f1v,        f2v,        f3v,        f4v,
  i1v,        i2v,        i3v,        i4v,
  matrix2fv,  matrix3fv,  matrix4fv
}

export type Uniform
  = { type: UNIFORM_TYPE.f1, value: number }
  | { type: UNIFORM_TYPE.f2, value: number[] | Float32Array }
  | { type: UNIFORM_TYPE.f3, value: number[] | Float32Array }
  | { type: UNIFORM_TYPE.f4, value: number[] | Float32Array }
  | { type: UNIFORM_TYPE.i1, value: number }
  | { type: UNIFORM_TYPE.i2, value: number[] | Int32Array }
  | { type: UNIFORM_TYPE.i3, value: number[] | Int32Array }
  | { type: UNIFORM_TYPE.i4, value: number[] | Int32Array }
  | { type: UNIFORM_TYPE.f1v, value: number[] | Float32Array }
  | { type: UNIFORM_TYPE.f2v, value: number[] | Float32Array }
  | { type: UNIFORM_TYPE.f3v, value: number[] | Float32Array }
  | { type: UNIFORM_TYPE.f4v, value: number[] | Float32Array }
  | { type: UNIFORM_TYPE.i1v, value: number[] | Int32Array }
  | { type: UNIFORM_TYPE.i2v, value: number[] | Int32Array }
  | { type: UNIFORM_TYPE.i3v, value: number[] | Int32Array }
  | { type: UNIFORM_TYPE.i4v, value: number[] | Int32Array }
  | { type: UNIFORM_TYPE.matrix2fv, value: number[] | Float32Array }
  | { type: UNIFORM_TYPE.matrix3fv, value: number[] | Float32Array }
  | { type: UNIFORM_TYPE.matrix4fv, value: number[] | Float32Array }

export interface Attribute { 
  type: ATTRIBUTE_TYPE, 
  value: ArrayLike<number>
  size: ATTRIBUTE_SIZE,
  offset?: number,
  stride?: number,
}

export interface ActiveAttribute extends Attribute {
  location: number
  buffer: WebGLBuffer
}

export interface Config {
  vsrc: ShaderSrc
  fsrc: ShaderSrc
  uniforms: Block<Uniform> 
  attributes: Block<Attribute>
}

export interface Command {
  program: WebGLProgram
  uniforms: Block<Uniform>
  uniformLocations: Block<WebGLUniformLocation>
  attributes: Block<ActiveAttribute>
}

export function createCommand<I extends Config> (gl: GL, cfg: I): Result {
  const { uniforms, vsrc, fsrc } = cfg

  return flatMap(fromSource(gl, vsrc, fsrc),                    program => 
         flatMap(setupUniforms(gl, program, uniforms),          uniformLocations => 
         flatMap(setupAttributes(gl, program, cfg.attributes),  attributes => 
         new Success({ program, uniforms, uniformLocations, attributes }))))
}

function setupUniforms (gl: GL, program: WebGLProgram, uniforms: Block<Uniform>): ActiveUniforms {
  const out: Block<WebGLUniformLocation> = {}

  for ( const name in uniforms ) {
    const uniform = uniforms[name]
    const location = gl.getUniformLocation(program, name) 

    if ( location == null ) return new Failure(`Could not find location for ${ name }`)
   
    if      ( uniform.type == UNIFORM_TYPE.f1 )        gl.uniform1f(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.f2 )        gl.uniform2f(location, uniform.value[0], uniform.value[1])
    else if ( uniform.type == UNIFORM_TYPE.f3 )        gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2])
    else if ( uniform.type == UNIFORM_TYPE.f4 )        gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
    else if ( uniform.type == UNIFORM_TYPE.i1 )        gl.uniform1i(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.i2 )        gl.uniform2i(location, uniform.value[0], uniform.value[1])
    else if ( uniform.type == UNIFORM_TYPE.i3 )        gl.uniform3i(location, uniform.value[0], uniform.value[1], uniform.value[2])
    else if ( uniform.type == UNIFORM_TYPE.i4 )        gl.uniform4i(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
    else if ( uniform.type == UNIFORM_TYPE.f1v )       gl.uniform1fv(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.f2v )       gl.uniform2fv(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.f3v )       gl.uniform3fv(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.f4v )       gl.uniform4fv(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.i1v )       gl.uniform1iv(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.i2v )       gl.uniform2iv(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.i3v )       gl.uniform3iv(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.i4v )       gl.uniform4iv(location, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.matrix2fv ) gl.uniformMatrix2fv(location, false, uniform.value)
    else if ( uniform.type == UNIFORM_TYPE.matrix3fv ) gl.uniformMatrix3fv(location, false, uniform.value)
    else                                               gl.uniformMatrix4fv(location, false, uniform.value)
    out[name] = location
  }
  return new Success(out)
}

function setupAttributes (gl: GL, program: WebGLProgram, attributes: Block<Attribute>): ActiveAttributes {
  const out: Block<ActiveAttribute> = {}

  for ( const name in attributes ) {
    const { type, value, size, offset, stride } = attributes[name]
    const location = gl.getAttribLocation(program, name) 

    if ( location == null ) return new Failure(`Could not find attrib ${ name }`)

    const buffer = gl.createBuffer()

    if ( buffer == null )   return new Failure('Could not create buffer')
     
    const content = value instanceof Float32Array ? value : new Float32Array(value)

    var glType: number
    if      ( type == ATTRIBUTE_TYPE.BYTE )   glType = gl.BYTE
    else if ( type == ATTRIBUTE_TYPE.U_BYTE)  glType = gl.UNSIGNED_BYTE
    else if ( type == ATTRIBUTE_TYPE.SHORT)   glType = gl.SHORT
    else if ( type == ATTRIBUTE_TYPE.U_SHORT) glType = gl.UNSIGNED_SHORT
    else                                      glType = gl.FLOAT

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, content, gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(location, size, glType, false, stride || 0, offset || 0)
    gl.enableVertexAttribArray(location)
    out[name] = { type, value, size, offset, stride, location, buffer }
  }
  return new Success(out)
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
  gl.useProgram(program)
  return program && gl.getProgramParameter(program, gl.LINK_STATUS) 
    ? new Success(program) 
    : new Failure(gl.getProgramInfoLog(program) || '')
}

function fromSource (gl: GL, vsrc: string, fsrc: string): Program {
  return flatMap(compileShader(gl, gl.VERTEX_SHADER, vsrc),   vertex =>
         flatMap(compileShader(gl, gl.FRAGMENT_SHADER, fsrc), fragment =>
         linkProgram(gl, vertex, fragment))) as Program
}
