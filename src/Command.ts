import { Either, fmap, flatMap, Success, Failure, unit } from './Either'

type GL = WebGLRenderingContext

export type Shader = Either<Error, WebGLShader>
export type Program = Either<Error, WebGLProgram>
export type Result = Either<Error, Command>

export type ShaderSrc = string
export type WebGLAttr = number

export type Attribute
  = { [name: string]: string | number }

export type Uniform
  = { [name: string]: string | number }

export interface Config {
  vsrc: ShaderSrc
  fsrc: ShaderSrc
  uniforms: Uniform
  attributes: Attribute
}

export interface Command {
  program: WebGLProgram
}

function compileShader (gl: GL, kind: number, src: string): Shader {
  const shader = gl.createShader(kind)
  const kindStr = kind === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'

  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader && gl.getShaderParameter(shader, gl.COMPILE_STATUS) 
    ? new Success(shader) 
    : new Failure(new Error(`${ kindStr }: ${ gl.getShaderInfoLog(shader) || '' }`))
}

function linkProgram (gl: GL, vertex: WebGLShader, fragment: WebGLShader): Program {
  const program = gl.createProgram()

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  return program && gl.getProgramParameter(program, gl.LINK_STATUS) 
    ? new Success(program) 
    : new Failure(new Error(gl.getProgramInfoLog(program) || ''))
}

function fromSource (gl: GL, vsrc: string, fsrc: string): Program {
  return flatMap(compileShader(gl, gl.VERTEX_SHADER, vsrc),   vertex =>
         flatMap(compileShader(gl, gl.FRAGMENT_SHADER, fsrc), fragment =>
         linkProgram(gl, vertex, fragment))) as Program
}

export function createCommand (gl: GL, cfg: Config): Result {
  return flatMap(fromSource(gl, cfg.vsrc, cfg.fsrc), program =>
         new Success({ program })) as Result
}
