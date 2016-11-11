import { Either, fmap, flatMap, Success, Failure, unit } from './Either'

type GL = WebGLRenderingContext

export type ActiveUniforms = Block<WebGLUniformLocation>
export type ActiveAttributes = Block<ActiveAttribute>
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
  = { kind: UNIFORM_TYPE.f1, value: number }
  | { kind: UNIFORM_TYPE.f2, vector: number[] | Float32Array }
  | { kind: UNIFORM_TYPE.f3, vector: number[] | Float32Array }
  | { kind: UNIFORM_TYPE.f4, vector: number[] | Float32Array }
  | { kind: UNIFORM_TYPE.i1, value: number }
  | { kind: UNIFORM_TYPE.i2, vector: number[] | Int32Array }
  | { kind: UNIFORM_TYPE.i3, vector: number[] | Int32Array }
  | { kind: UNIFORM_TYPE.i4, vector: number[] | Int32Array }
  | { kind: UNIFORM_TYPE.f1v, list: number[] | Float32Array }
  | { kind: UNIFORM_TYPE.f2v, list: number[] | Float32Array }
  | { kind: UNIFORM_TYPE.f3v, list: number[] | Float32Array }
  | { kind: UNIFORM_TYPE.f4v, list: number[] | Float32Array }
  | { kind: UNIFORM_TYPE.i1v, list: number[] | Int32Array }
  | { kind: UNIFORM_TYPE.i2v, list: number[] | Int32Array }
  | { kind: UNIFORM_TYPE.i3v, list: number[] | Int32Array }
  | { kind: UNIFORM_TYPE.i4v, list: number[] | Int32Array }
  | { kind: UNIFORM_TYPE.matrix2fv, matrices: number[] | Float32Array }
  | { kind: UNIFORM_TYPE.matrix3fv, matrices: number[] | Float32Array }
  | { kind: UNIFORM_TYPE.matrix4fv, matrices: number[] | Float32Array }

export interface Attribute { 
  kind: ATTRIBUTE_TYPE, 
  value: ArrayLike<number>
  size: ATTRIBUTE_SIZE,
  offset?: number,
  stride?: number,
}

export interface ActiveAttribute extends Attribute {
  loc: number
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

export function createCommand<I extends Config> (gl: GL, cfg: I): Either<Command> {
  const { uniforms, vsrc, fsrc } = cfg

  return flatMap(fromSource(gl, vsrc, fsrc),                    program => 
         flatMap(setupUniforms(gl, program, uniforms),          uniformLocations => 
         flatMap(setupAttributes(gl, program, cfg.attributes),  attributes => {
           setUniforms(gl, program, uniformLocations, uniforms)
           return new Success({ program, uniforms, uniformLocations, attributes })})))
}

function setupUniforms (gl: GL, program: WebGLProgram, uniforms: Block<Uniform>): Either<ActiveUniforms> {
  const out: Block<WebGLUniformLocation> = {}

  for ( const name in uniforms ) {
    const uniform = uniforms[name]
    const loc = gl.getUniformLocation(program, name) 

    if ( loc == null ) return new Failure(`Could not find location for ${ name }`)
    out[name] = loc
  }
  return new Success(out)
}

function setUniforms (gl: GL, program: WebGLProgram, activeUniforms: ActiveUniforms, uniforms: Block<Uniform>) {
  for ( const key in uniforms ) {
    const uniform = uniforms[key]
    const loc = activeUniforms[key]

    switch ( uniform.kind ) {
      case UNIFORM_TYPE.f1:        gl.uniform1f(loc, uniform.value); break;
      case UNIFORM_TYPE.f2:        gl.uniform2f(loc, uniform.vector[0], uniform.vector[1]); break;
      case UNIFORM_TYPE.f3:        gl.uniform3f(loc, uniform.vector[0], uniform.vector[1], uniform.vector[2]); break;
      case UNIFORM_TYPE.f4:        gl.uniform4f(loc, uniform.vector[0], uniform.vector[1], uniform.vector[2], uniform.vector[3]); break;
      case UNIFORM_TYPE.i1:        gl.uniform1i(loc, uniform.value); break;
      case UNIFORM_TYPE.i2:        gl.uniform2i(loc, uniform.vector[0], uniform.vector[1]); break;
      case UNIFORM_TYPE.i3:        gl.uniform3i(loc, uniform.vector[0], uniform.vector[1], uniform.vector[2]); break;
      case UNIFORM_TYPE.i4:        gl.uniform4i(loc, uniform.vector[0], uniform.vector[1], uniform.vector[2], uniform.vector[3]); break;
      case UNIFORM_TYPE.f1v:       gl.uniform1fv(loc, uniform.list); break;
      case UNIFORM_TYPE.f2v:       gl.uniform2fv(loc, uniform.list); break;
      case UNIFORM_TYPE.f3v:       gl.uniform3fv(loc, uniform.list); break;
      case UNIFORM_TYPE.f4v:       gl.uniform4fv(loc, uniform.list); break;
      case UNIFORM_TYPE.i1v:       gl.uniform1iv(loc, uniform.list); break;
      case UNIFORM_TYPE.i2v:       gl.uniform2iv(loc, uniform.list); break;
      case UNIFORM_TYPE.i3v:       gl.uniform3iv(loc, uniform.list); break;
      case UNIFORM_TYPE.i4v:       gl.uniform4iv(loc, uniform.list); break;
      case UNIFORM_TYPE.matrix2fv: gl.uniformMatrix2fv(loc, false, uniform.matrices); break;
      case UNIFORM_TYPE.matrix3fv: gl.uniformMatrix3fv(loc, false, uniform.matrices); break;
      case UNIFORM_TYPE.matrix4fv: gl.uniformMatrix4fv(loc, false, uniform.matrices); break;
    }
  }
}

function setupAttributes (gl: GL, program: WebGLProgram, attributes: Block<Attribute>): Either<ActiveAttributes> {
  const out: Block<ActiveAttribute> = {}

  for ( const name in attributes ) {
    const { kind, value, size, offset, stride } = attributes[name]
    const loc = gl.getAttribLocation(program, name) 

    if ( loc == null ) return new Failure(`Could not find attrib ${ name }`)

    const buffer = gl.createBuffer()

    if ( buffer == null ) return new Failure('Could not create buffer')
     
    const content = value instanceof Float32Array ? value : new Float32Array(value)

    var glType: number
    if      ( kind == ATTRIBUTE_TYPE.BYTE )    glType = gl.BYTE
    else if ( kind == ATTRIBUTE_TYPE.U_BYTE )  glType = gl.UNSIGNED_BYTE
    else if ( kind == ATTRIBUTE_TYPE.SHORT )   glType = gl.SHORT
    else if ( kind == ATTRIBUTE_TYPE.U_SHORT ) glType = gl.UNSIGNED_SHORT
    else                                       glType = gl.FLOAT

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, content, gl.DYNAMIC_DRAW)
    gl.vertexAttribPointer(loc, size, glType, false, stride || 0, offset || 0)
    gl.enableVertexAttribArray(loc)
    out[name] = { kind, value, size, offset, stride, loc, buffer }
  }
  return new Success(out)
}

function compileShader (gl: GL, kind: number, src: string): Either<WebGLShader> {
  const shader = gl.createShader(kind)
  const kindStr = kind === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'

  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader && gl.getShaderParameter(shader, gl.COMPILE_STATUS) 
    ? new Success(shader) 
    : new Failure(`${ kindStr }: ${ gl.getShaderInfoLog(shader) || '' }`)
}

function linkProgram (gl: GL, vertex: WebGLShader, fragment: WebGLShader): Either<WebGLProgram> {
  const program = gl.createProgram()

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.useProgram(program)
  return program && gl.getProgramParameter(program, gl.LINK_STATUS) 
    ? new Success(program) 
    : new Failure(gl.getProgramInfoLog(program) || '')
}

function fromSource (gl: GL, vsrc: string, fsrc: string): Either<WebGLProgram> {
  return flatMap(compileShader(gl, gl.VERTEX_SHADER, vsrc),   vertex =>
         flatMap(compileShader(gl, gl.FRAGMENT_SHADER, fsrc), fragment =>
         linkProgram(gl, vertex, fragment)))
}
