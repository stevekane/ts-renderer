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
  const program = gl.createProgram()

  if ( vertex.success )   gl.attachShader(program, vertex.value)
  if ( fragment.success ) gl.attachShader(program, fragment.value)

  gl.linkProgram(program)

  const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
  const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
  const log = gl.getProgramInfoLog(program) || ''

  return program && gl.getProgramParameter(program, gl.LINK_STATUS) 
    ? new Success(program) 
    : new Failure({ fragment, vertex, log })
}

export function fromSource (gl: GL, vsrc: string, fsrc: string): Program {
  return linkProgram(
    gl, 
    compileShader(gl, gl.VERTEX_SHADER, vsrc), 
    compileShader(gl, gl.FRAGMENT_SHADER, fsrc))
}
