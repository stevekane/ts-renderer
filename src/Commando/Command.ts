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
  uniforms?: { [ K in keyof U ]?: U[K] }
  attributes?: { [ K in keyof A ]?: A[K] }
  count: number
}

export function run<U, A> ( cmd: Command<U, A>, p: Params<U, A> ) {
  const { gl, program } = cmd
  const { attributes, uniforms, count } = p

  gl.useProgram(program)

  for ( const key in cmd.uniforms ) {
    const { loc, value } = cmd.uniforms[key]
    const val = uniforms && uniforms[key] != null ? uniforms[key] : value

    // This is absolutely not type-safe.  I can pass literally anything I want to the function
    // and it will fail at run-time.  Unsure why...
    cmd.uniforms[key].set(gl, loc, val)
  }

  for ( const key in cmd.attributes ) {
    gl.enableVertexAttribArray(cmd.attributes[key].loc)
  }

  /*
    TODO: This doesn't work because the types don't flow through from CFG to Attribute in the
    same that they do with the type parameter <T> in each instance of Uniforms.  

    I probably need to make 5 classes implementing a generic interfaces for Attributes
    similar to the classes and generic type in Uniforms.  This will allow the compiler to
    understand that the type of data found in an AttrCfg<T> and shape-matching Attr<T> are 
    the same.
  */
  // if ( attributes != null ) {
  //   for ( const key in attributes ) {
  //     const val = attributes[key]

  //     if ( val != null ) {
  //       gl.bufferData(gl.ARRAY_BUFFER, val, gl.DYNAMIC_DRAW)
  //     }
  //   }
  // }

  gl.drawArrays(gl.TRIANGLES, 0, count)

  for ( const key in cmd.attributes ) {
    gl.disableVertexAttribArray(cmd.attributes[key].loc)
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

  for ( const key in ucfgs ) {
    const uniform = setupUniform(gl, program, key, ucfgs[key])

    if ( uniform instanceof Error ) return uniform
    else                            out[key] = uniform
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
