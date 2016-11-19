import { Either, flatMap, Success, Failure } from './Either'

export type Block<T> = { [ name: string ]: T }
export type Indexable = { [ x: string ]: any }
export type Box<T> = { value: T }
export type Boxified<T extends Indexable> = { [ K in keyof T ]: Box<T[K]> }
export type Partial<T extends Indexable> = { [ K in keyof T ]?: T[K] }

const cfg = {
  age: { value: 5 },
  position: { value: [ 1, 1, 1 ] }
}

const part = {
  age: 5,
  position: [ 2, 2, 2 ]
}

function sec <P extends Indexable> (w: Boxified<P>, p: P) {
  for ( const key in w ) {
    if ( p[key] ) console.log(`Found an updated ${ key }`)
    else          console.log(`Using default ${ key }`)
  }
}

sec(cfg, part)
// sec(cfg, 7)

export type GL = WebGLRenderingContext
export type WebGLAttributeLocation = number
export type ShaderSrc = string

export type AttributeSize = 1 | 2 | 3 | 4
export enum AttributeType { BYTE, U_BYTE, SHORT, U_SHORT, FLOAT }
export enum UniformType { F, F2, F3, F4, I, I2, I3, I4, FV, FV2, FV3, FV4, IV, IV2, IV3, IV4, MAT2, MAT3, MAT4 }

export type Uniform
  = { kind: UniformType.F, value: number }
  | { kind: UniformType.F2, value: number[] | Float32Array }
  | { kind: UniformType.F3, value: number[] | Float32Array }
  | { kind: UniformType.F4, value: number[] | Float32Array }
  | { kind: UniformType.I, value: number }
  | { kind: UniformType.I2, value: number[] | Int32Array }
  | { kind: UniformType.I3, value: number[] | Int32Array }
  | { kind: UniformType.I4, value: number[] | Int32Array }
  | { kind: UniformType.FV, value: number[] | Float32Array }
  | { kind: UniformType.FV2, value: number[] | Float32Array }
  | { kind: UniformType.FV3, value: number[] | Float32Array }
  | { kind: UniformType.FV4, value: number[] | Float32Array }
  | { kind: UniformType.IV, value: number[] | Int32Array }
  | { kind: UniformType.IV2, value: number[] | Int32Array }
  | { kind: UniformType.IV3, value: number[] | Int32Array }
  | { kind: UniformType.IV4, value: number[] | Int32Array }
  | { kind: UniformType.MAT2, value: number[] | Float32Array }
  | { kind: UniformType.MAT3, value: number[] | Float32Array }
  | { kind: UniformType.MAT4, value: number[] | Float32Array }

export interface Attribute { 
  kind: AttributeType
  value: ArrayLike<number>
  size: AttributeSize
  offset?: number
  stride?: number
}

export interface Source {
  vsrc: ShaderSrc
  fsrc: ShaderSrc
}

export interface Config {
  uniforms: Block<Uniform> 
  attributes: Block<Attribute>
  count: number
}

// Make the shape of locations/buffers derived from shape of Config... or whatever
export interface Command extends Config {
  program: WebGLProgram
  uniformLocations: Block<WebGLUniformLocation> 
  attributeLocations: Block<WebGLAttributeLocation>
  buffers: Block<WebGLBuffer>
}

export function run (gl: GL, c: Command, cfg: Config) {
  gl.useProgram(c.program)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.depthFunc(gl.LEQUAL)

  for ( const key in c.uniforms )   setUniform(gl, c.uniformLocations[key], cfg.uniforms[key] || c.uniforms[key])
  for ( const key in c.attributes ) setAttribute(gl, c.attributeLocations[key], c.buffers[key], cfg.attributes[key] || c.attributes[key])

  gl.drawArrays(gl.TRIANGLES, 0, cfg.count)

  for ( const key in c.attributeLocations ) gl.disableVertexAttribArray(c.attributeLocations[key])

  gl.useProgram(null)
}

export function createCommand<I extends Source & Config> (gl: GL, cfg: I): Either<Command> {
  const { count, uniforms, attributes, vsrc, fsrc } = cfg

  return flatMap(fromSource(gl, vsrc, fsrc),                                program => 
         flatMap(locateUniforms(gl, program, uniforms),                     uniformLocations => 
         flatMap(locateAttributes(gl, program, attributes),                 attributeLocations =>
         flatMap(setupBuffers(gl, attributes, attributeLocations), buffers => {
           for ( const key in uniforms )   setUniform(gl, uniformLocations[key], uniforms[key])
           for ( const key in attributes ) setAttribute(gl, attributeLocations[key], buffers[key], attributes[key]) 
           return new Success({ program, uniforms, attributes, uniformLocations, attributeLocations, buffers, count })}))))
}

function locateUniforms (gl: GL, program: WebGLProgram, uniforms: Block<Uniform>): Either<Block<WebGLUniformLocation>> {
  const out: Block<WebGLUniformLocation>= {}

  for ( const name in uniforms ) {
    const loc = gl.getUniformLocation(program, name) 

    if ( loc == null ) return new Failure(`Could not find location for ${ name }`)
    out[name] = loc
  }
  return new Success(out)
}

function locateAttributes (gl: GL, program: WebGLProgram, attributes: Block<Attribute>): Either<Block<WebGLAttributeLocation>> {
  const out: Block<WebGLAttributeLocation> = {}

  for ( const name in attributes ) {
    const loc = gl.getAttribLocation(program, name) 

    if ( loc == null ) return new Failure(`Could not find attribute ${ name }`)
    out[name] = loc
  }
  return new Success(out)
}

function mapToGLType ( gl: GL, t: AttributeType ): number {
  switch ( t ) {
    case AttributeType.BYTE:    return gl.BYTE 
    case AttributeType.U_BYTE:  return gl.UNSIGNED_BYTE 
    case AttributeType.SHORT:   return gl.SHORT
    case AttributeType.U_SHORT: return gl.UNSIGNED_SHORT
    case AttributeType.FLOAT:   return gl.FLOAT 
    default:                    const check: never = t
                                return check
  } 
}
 
function setupBuffers (gl: GL, attributes: Block<Attribute>, attributeLocations: Block<number>): Either<Block<WebGLBuffer>> {
  const out: Block<WebGLBuffer> = {}

  for ( const name in attributes ) {
    const { kind, size, offset = 0, stride = 0 } = attributes[name]
    const glType = mapToGLType(gl, kind)
    const loc = attributeLocations[name]
    const buffer = gl.createBuffer()

    if ( buffer == null ) return new Failure('Could not create buffer')

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(loc, size, glType, false, stride, offset)
    gl.enableVertexAttribArray(loc)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
     
    out[name] = buffer
  }
  return new Success(out)
}

function setUniform (gl: GL, loc: WebGLUniformLocation, uniform: Uniform) {
  switch ( uniform.kind ) {
    case UniformType.F:    return gl.uniform1f(loc, uniform.value) 
    case UniformType.F2:   return gl.uniform2f(loc, uniform.value[0], uniform.value[1]) 
    case UniformType.F3:   return gl.uniform3f(loc, uniform.value[0], uniform.value[1], uniform.value[2])
    case UniformType.F4:   return gl.uniform4f(loc, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
    case UniformType.I:    return gl.uniform1i(loc, uniform.value)
    case UniformType.I2:   return gl.uniform2i(loc, uniform.value[0], uniform.value[1])
    case UniformType.I3:   return gl.uniform3i(loc, uniform.value[0], uniform.value[1], uniform.value[2])
    case UniformType.I4:   return gl.uniform4i(loc, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
    case UniformType.FV:   return gl.uniform1fv(loc, uniform.value)
    case UniformType.FV2:  return gl.uniform2fv(loc, uniform.value)
    case UniformType.FV3:  return gl.uniform3fv(loc, uniform.value)
    case UniformType.FV4:  return gl.uniform4fv(loc, uniform.value)
    case UniformType.IV:   return gl.uniform1iv(loc, uniform.value)
    case UniformType.IV2:  return gl.uniform2iv(loc, uniform.value)
    case UniformType.IV3:  return gl.uniform3iv(loc, uniform.value)
    case UniformType.IV4:  return gl.uniform4iv(loc, uniform.value)
    case UniformType.MAT2: return gl.uniformMatrix2fv(loc, false, uniform.value)
    case UniformType.MAT3: return gl.uniformMatrix3fv(loc, false, uniform.value)
    case UniformType.MAT4: return gl.uniformMatrix4fv(loc, false, uniform.value)
    default:               const check: never = uniform
                           return check
  }
}

function setAttribute (gl: GL, loc: WebGLAttributeLocation, buffer: WebGLBuffer, attribute: Attribute) {
  const { value } = attribute
  const content = value instanceof Float32Array ? value : new Float32Array(value)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, content, gl.DYNAMIC_DRAW)
  gl.enableVertexAttribArray(loc)
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
