import { GL, Program, Shader, ShaderSrc } from './GLTypes'
import { UniformCfgs, Uniforms } from './Uniforms'
import { AttributeCfgs, Attributes, setupAttribute } from './Attributes'
import { toError } from './utils'

export interface ICommandCfg<U, A> {
  vsrc: string
  fsrc: string
  uniforms: UniformCfgs<U>
  attributes: AttributeCfgs<A>
}

export interface ICommand<U, A> {
  uniforms: Uniforms<U>
  attributes: Attributes<A>
}

export function createCommand<U, A> ( gl: GL, cfg: ICommandCfg<U, A> ): ICommand<U, A> | Error {
  const program = fromSource(gl, cfg.vsrc, cfg.fsrc)

  if ( program instanceof Error ) return program

  const uniforms = setupUniforms(gl, program, cfg.uniforms)

  if ( uniforms instanceof Error ) uniforms

  const attributes = setupAttributes(gl, program, cfg.attributes)

  if ( attributes instanceof Error ) return attributes

  return { gl, program, uniforms, attributes } as ICommand<U, A>
}

function setupUniforms<T> ( gl: GL, program: Program, ucfgs: UniformCfgs<T> ): Uniforms<T> | Error {
  const out = {} as Uniforms<T>

  for ( const key in ucfgs ) {
    const { value, set } = ucfgs[key]
    const loc = gl.getUniformLocation(program, key)

    if ( loc == null ) return new Error(`Could not find uniform ${ key }`)
    else               out[key] = { value, set, loc } // TODO: could move to Uniforms as setupUniform for consistency
  }
  return out
}

function setupAttributes<T> ( gl: GL, program: Program, uattrs: AttributeCfgs<T> ): Attributes<T> | Error {
  const out = {} as Attributes<T>

  for ( const key in uattrs ) {
    const attr = setupAttribute(gl, program, key, uattrs[key])

    if ( attr instanceof Error ) return attr
    else                         out[key] = attr
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
