import { GL, Program, Shader, ShaderSrc } from './GLTypes'
import { UniformCfgs, Uniforms, setupUniform } from './Uniforms'
import { AttributeCfgs, Attributes, setupAttribute } from './Attributes'
import { toError } from './utils'

export interface CommandCfg<U, A> {
  vsrc: string
  fsrc: string
  uniforms: UniformCfgs<U>
  attributes: AttributeCfgs<A>
}

export interface Command<U, A> {
  gl: GL
  program: Program
  uniforms: Uniforms<U>
  attributes: Attributes<A>
}

export interface Params<U, A> {
  uniforms?: Partial<U>
  attributes?: Partial<A> 
  count: number
}

export function run<U, A> ( cmd: Command<U, A>, p: Params<U, A> ) {
  const { gl, program } = cmd
  const { attributes, uniforms, count } = p

  gl.useProgram(program)

  for ( const key in cmd.uniforms ) {
    const { loc, value, set } = cmd.uniforms[key]
    const val = uniforms && uniforms[key] || value

    set(gl, loc, val)
  }

  for ( const key in cmd.attributes ) {
    const a = cmd.attributes[key]
    const val = attributes && attributes[key]

    a.setup(gl, a)
    if ( val != null ) a.set(gl, a, val)
  }

  gl.drawArrays(gl.TRIANGLES, 0, count)

  for ( const key in cmd.attributes ) {
    const a = cmd.attributes[key]

    a.teardown(gl, a)
  }

  gl.useProgram(null)
}


export function createCommand<U, A> ( gl: GL, cfg: CommandCfg<U, A> ): Command<U, A> | Error {
  const program = fromSource(gl, cfg.vsrc, cfg.fsrc)

  if ( program instanceof Error ) return program

  const uniforms = setupUniforms(gl, program, cfg.uniforms)

  if ( uniforms instanceof Error ) uniforms

  const attributes = setupAttributes(gl, program, cfg.attributes)

  if ( attributes instanceof Error ) return attributes

  return { gl, program, uniforms, attributes } as Command<U, A>
}

function setupUniforms<T> ( gl: GL, program: Program, ucfgs: UniformCfgs<T> ): Uniforms<T> | Error {
  const out = {} as Uniforms<T>

  gl.useProgram(program)
  for ( const key in ucfgs ) {
    const uniform = setupUniform(gl, program, key, ucfgs[key])

    if ( uniform instanceof Error ) return uniform
    else                            out[key] = uniform
  }
  gl.useProgram(null)
  return out
}

function setupAttributes<T> ( gl: GL, program: Program, uattrs: AttributeCfgs<T> ): Attributes<T> | Error {
  const out = {} as Attributes<T>

  gl.useProgram(program)
  for ( const key in uattrs ) {
    const attr = setupAttribute(gl, program, key, uattrs[key])

    if ( attr instanceof Error ) return attr
    else                         out[key] = attr
  }
  gl.useProgram(null)
  return out 
}

export function compileShader ( gl: GL, kind: number, src: ShaderSrc ): Shader | Error {
  const shader = gl.createShader(kind)
  const kindStr = kind === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'

  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader && gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    ? shader
    : new Error(`${ kindStr }: ${ gl.getShaderInfoLog(shader) || '' }`)
}

export function fromSource ( gl: GL, vsrc: ShaderSrc, fsrc: ShaderSrc ): Program | Error {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vsrc)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fsrc)
  const program = gl.createProgram()

  if ( vertex instanceof Error ) return vertex
  if ( fragment instanceof Error ) return fragment

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)

  return program && gl.getProgramParameter(program, gl.LINK_STATUS) 
    ? program 
    : new Error(gl.getProgramInfoLog(program) || '')
}
