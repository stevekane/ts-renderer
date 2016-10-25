import { Success, Failure, Either } from './Either'

export type GL = WebGLRenderingContext
export type Shader = Either<ShaderError, WebGLShader>
export type Program = Either<ProgramError, WebGLProgram>
export interface ShaderError { 
  src: string 
  log: string
}

export interface ProgramError { 
  vertex: Shader
  fragment: Shader 
  log: string
}

function compileShader (gl: GL, kind: number, src: string): Shader {
  const shader = gl.createShader(kind)

  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader && gl.getShaderParameter(shader, gl.COMPILE_STATUS) 
    ? new Success(shader) 
    : new Failure({ src, log: gl.getShaderInfoLog(shader) || '' })
}

function linkProgram (gl: GL, vertex: Shader, fragment: Shader): Program {
  const p = gl.createProgram()

  if ( vertex.success )   gl.attachShader(p, vertex.value)
  if ( fragment.success ) gl.attachShader(p, fragment.value)
  gl.linkProgram(p)
  return p && gl.getProgramParameter(p, gl.LINK_STATUS) 
    ? new Success(p) 
    : new Failure({ fragment, vertex, log: gl.getProgramInfoLog(p) || '' })
}

export function fromSource (gl: GL, vsrc: string, fsrc: string): Program {
  return linkProgram(
    gl, 
    compileShader(gl, gl.VERTEX_SHADER, vsrc), 
    compileShader(gl, gl.FRAGMENT_SHADER, fsrc))
}
