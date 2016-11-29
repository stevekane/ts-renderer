import { GL, Program, Shader, ShaderSrc } from './GLTypes'
import { UniformCfgs, Uniforms } from './Uniforms'
import { toError } from './utils'

export interface ICommandCfg<U> {
  vsrc: string
  fsrc: string
  uniforms: UniformCfgs<U>
}

export interface ICommand<U> {
  uniforms: Uniforms<U>
}

export function createCommand<U> ( gl: GL, cfg: ICommandCfg<U> ): ICommand<U> | Error {
  const program = fromSource(gl, cfg.vsrc, cfg.fsrc)

  if ( program instanceof Error ) return program

  const uniforms = locateUniforms(gl, program, cfg.uniforms)

  if ( uniforms instanceof Error ) return new Error(uniforms.message)

  return { gl, program, uniforms } as ICommand<U>
}

function locateUniforms<T> ( gl: GL, program: Program, ucfgs: UniformCfgs<T> ): Uniforms<T> | Error {
  const out = {} as Uniforms<T>

  for ( const key in ucfgs ) {
    const { value, set } = ucfgs[key]
    const loc = gl.getUniformLocation(program, key)

    if ( loc == null ) return new Error(`Could not find uniform ${ key }`)
    else               out[key] = { value, set, loc }
  }
  return out
}

function compileShader ( gl: GL, kind: number, src: ShaderSrc ): Shader | Error {
  const shader = gl.createShader(kind)
  const kindStr = kind === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'

  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader && gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    ? shader
    : new Error(`${ kindStr }: ${ gl.getShaderInfoLog(shader) || '' }`)
}

function fromSource ( gl: GL, vsrc: ShaderSrc, fsrc: ShaderSrc ): Program | Error {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vsrc)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fsrc)
  const program = gl.createProgram()

  if ( vertex instanceof Error ) return vertex
  if ( fragment instanceof Error ) return fragment

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.useProgram(program)

  return program && gl.getProgramParameter(program, gl.LINK_STATUS) 
    ? program 
    : new Error(gl.getProgramInfoLog(program) || '')
}
