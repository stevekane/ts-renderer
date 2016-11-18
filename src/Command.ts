import { Either, fmap, flatMap, Success, Failure, unit } from './Either'

export type Block<T> = { [ name: string ]: T }
export type Indexable = { [ x: string ]: any }
export type Box<T> = { value: T }
export type Boxified<T extends Indexable> = { [ K in keyof T ]: Box<T[K]> }
export type Partial<T extends Indexable> = { [ K in keyof T ]?: T[K] }
export type PartialBoxifed<T extends Indexable> = { [ K in keyof T ]?: Box<T[K]> }

export type GL = WebGLRenderingContext
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
  kind: AttributeType, 
  value: ArrayLike<number>
  size: AttributeSize,
  offset?: number,
  stride?: number,
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
  attributeLocations: Block<number>
  buffers: Block<WebGLBuffer>
}

export function run (gl: GL, c: Command, cfg: Config) {
  gl.useProgram(c.program)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.depthFunc(gl.LEQUAL)

  // TODO: We should actually loop over the uniforms in c, setting them from c or from cfg... i think
  // TODO: Same as above for attribtues... I think
  setUniforms(gl, c.program, c.uniformLocations, c.uniforms)
  setUniforms(gl, c.program, c.uniformLocations, cfg.uniforms)
  setAttributes(gl, c.program, c.attributeLocations, c.buffers, c.attributes)
  setAttributes(gl, c.program, c.attributeLocations, c.buffers, cfg.attributes)

  gl.drawArrays(gl.TRIANGLES, 0, cfg.count)

  for ( var key in c.attributeLocations ) {
    gl.disableVertexAttribArray(c.attributeLocations[key])
  }

  gl.useProgram(null)
}

export function createCommand<I extends Source & Config> (gl: GL, cfg: I): Either<Command> {
  const { count, uniforms, attributes, vsrc, fsrc } = cfg

  return flatMap(fromSource(gl, vsrc, fsrc),                                program => 
         flatMap(locateUniforms(gl, program, uniforms),                     uniformLocations => 
         flatMap(locateAttributes(gl, program, attributes),                 attributeLocations =>
         flatMap(setupBuffers(gl, program, attributes, attributeLocations), buffers => {
           setUniforms(gl, program, uniformLocations, uniforms)
           setAttributes(gl, program, attributeLocations, buffers, attributes)
           return new Success({ program, uniforms, attributes, uniformLocations, attributeLocations, buffers, count })}))))
}

function locateUniforms (gl: GL, program: WebGLProgram, uniforms: Block<Uniform>): Either<Block<WebGLUniformLocation>> {
  const out: Block<WebGLUniformLocation>= {}

  for ( const name in uniforms ) {
    const uniform = uniforms[name]
    const loc = gl.getUniformLocation(program, name) 

    if ( loc == null ) return new Failure(`Could not find location for ${ name }`)
    out[name] = loc
  }
  return new Success(out)
}

function locateAttributes (gl: GL, program: WebGLProgram, attributes: Block<Attribute>): Either<Block<number>> {
  const out: Block<number> = {}

  for ( const name in attributes ) {
    const loc = gl.getAttribLocation(program, name) 

    if ( loc == null ) return new Failure(`Could not find attribute ${ name }`)
    out[name] = loc
  }
  return new Success(out)
}

function setupBuffers (gl: GL, program: WebGLProgram, attributes: Block<Attribute>, attributeLocations: Block<number>): Either<Block<WebGLBuffer>> {
  const out: Block<WebGLBuffer> = {}

  for ( const name in attributes ) {
    const { kind, size, offset = 0, stride = 0 } = attributes[name]
    const loc = attributeLocations[name]
    const buffer = gl.createBuffer()

    if ( buffer == null ) return new Failure('Could not create buffer')

    var glType: number
    if      ( kind == AttributeType.BYTE )    glType = gl.BYTE
    else if ( kind == AttributeType.U_BYTE )  glType = gl.UNSIGNED_BYTE
    else if ( kind == AttributeType.SHORT )   glType = gl.SHORT
    else if ( kind == AttributeType.U_SHORT ) glType = gl.UNSIGNED_SHORT
    else                                      glType = gl.FLOAT

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(loc, size, glType, false, stride, offset)
    gl.enableVertexAttribArray(loc)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
     
    out[name] = buffer
  }
  return new Success(out)
}

function setUniforms (gl: GL, program: WebGLProgram, uniformLocations: Block<WebGLUniformLocation>, uniforms: Block<Uniform>) {
  for ( const key in uniforms ) {
    const uniform = uniforms[key]
    const loc = uniformLocations[key]

    // switch statement seems to get fucked up here... unsure why.  it cannot see to infer the key to use for discrimination
    if      ( uniform.kind === UniformType.F )    gl.uniform1f(loc, uniform.value)
    else if ( uniform.kind === UniformType.F2 )   gl.uniform2f(loc, uniform.value[0], uniform.value[1])
    else if ( uniform.kind === UniformType.F3 )   gl.uniform3f(loc, uniform.value[0], uniform.value[1], uniform.value[2])
    else if ( uniform.kind === UniformType.F4 )   gl.uniform4f(loc, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
    else if ( uniform.kind === UniformType.I )    gl.uniform1i(loc, uniform.value)
    else if ( uniform.kind === UniformType.I2 )   gl.uniform2i(loc, uniform.value[0], uniform.value[1])
    else if ( uniform.kind === UniformType.I3 )   gl.uniform3i(loc, uniform.value[0], uniform.value[1], uniform.value[2])
    else if ( uniform.kind === UniformType.I4 )   gl.uniform4i(loc, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
    else if ( uniform.kind === UniformType.FV )   gl.uniform1fv(loc, uniform.value)
    else if ( uniform.kind === UniformType.FV2 )  gl.uniform2fv(loc, uniform.value)
    else if ( uniform.kind === UniformType.FV3 )  gl.uniform3fv(loc, uniform.value)
    else if ( uniform.kind === UniformType.FV4 )  gl.uniform4fv(loc, uniform.value)
    else if ( uniform.kind === UniformType.IV )   gl.uniform1iv(loc, uniform.value)
    else if ( uniform.kind === UniformType.IV2 )  gl.uniform2iv(loc, uniform.value)
    else if ( uniform.kind === UniformType.IV3 )  gl.uniform3iv(loc, uniform.value)
    else if ( uniform.kind === UniformType.IV4 )  gl.uniform4iv(loc, uniform.value)
    else if ( uniform.kind === UniformType.MAT2 ) gl.uniformMatrix2fv(loc, false, uniform.value)
    else if ( uniform.kind === UniformType.MAT3 ) gl.uniformMatrix3fv(loc, false, uniform.value)
    else if ( uniform.kind === UniformType.MAT4 ) gl.uniformMatrix4fv(loc, false, uniform.value)
  }
}

function setAttributes (gl: GL, program: WebGLProgram, attributeLocations: Block<number>, buffers: Block<WebGLBuffer>, attributes: Block<Attribute>) {
  for ( const name in attributes ) {
    const { value } = attributes[name]
    const loc = attributeLocations[name]
    const buffer = buffers[name]
    const content = value instanceof Float32Array ? value : new Float32Array(value)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, content, gl.DYNAMIC_DRAW)
    gl.enableVertexAttribArray(loc)
  }
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
