import { Either, flatMap, Success, Failure } from './Either'

export type Block<T> = { [ name: string ]: T }
export type Indexable = { [ x: string ]: any }
export type Box<T> = { value: T }
export type Boxified<T extends Indexable> = { [ K in keyof T ]: Box<T[K]> }
export type Partial<T extends Indexable> = { [ K in keyof T ]?: T[K] }
export type GL = WebGLRenderingContext
export type WebGLAttributeLocation = number
export type ShaderSrc = string

export type AttributeSize = 1 | 2 | 3 | 4
export enum AttributeType { BYTE, U_BYTE, SHORT, U_SHORT, FLOAT }
export enum UniformType { F, F2, F3, F4, I, I2, I3, I4, FV, FV2, FV3, FV4, IV, IV2, IV3, IV4, MAT2, MAT3, MAT4 }
export type Floats = number[] | Float32Array
export type Ints = number[] | Int32Array

interface F { tag: 'F', value: number }
interface F2 { tag: 'F2', value: number[] }
type GLT = F | F2

function update ( u: F, v: F['value'] ): void
function update ( u: F2, v: F2['value'] ): void
function update ( u: GLT, v: any ) {
  switch ( u.tag ) {
    case 'F':  return console.log(u.value + v) //u.value + v)
    case 'F2': return console.log(u.value.concat(v)) //.value.concat(v))
    default:   const n: never = u
               return n
  }
}

update({ tag: 'F', value: 5 }, 3)
update({ tag: 'F2', value: [ 5 ] }, [ 2 ])
// update({ tag: 'F2', value: [ 5 ] }, 2)
// matches({ tag: 'F2', value: [ 5 ] }, 2)

export type UniformConfig
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

export type Uniform = { 
  kind: UniformType,
  loc: WebGLUniformLocation
}

export type AttributeConfig = {
  kind: AttributeType
  value: ArrayLike<number> | WebGLBuffer
  size: AttributeSize
  offset?: number
  stride?: number
}

export type Attribute = { 
  kind: AttributeType
  loc: WebGLAttributeLocation
  buffer: WebGLBuffer 
}

export type Config = {
  vsrc: ShaderSrc
  fsrc: ShaderSrc
  uniforms: Block<UniformConfig> 
  attributes: Block<AttributeConfig>
  count: number
}

export type Command = {
  program: WebGLProgram
  uniforms: Block<Uniform>
  attributes: Block<Attribute>
  count: number
}

export function run (gl: GL, c: Command, cfg: Indexable) {
  gl.useProgram(c.program)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.depthFunc(gl.LEQUAL)

  cfg
  // for ( const key in c.uniforms )   setUniform(gl, c.uniformLocations[key], cfg.uniforms[key] || c.uniforms[key])
  // for ( const key in c.attributes ) setAttribute(gl, c.attributeLocations[key], c.buffers[key], cfg.attributes[key] || c.attributes[key])

  // gl.drawArrays(gl.TRIANGLES, 0, cfg.count)

  // for ( const key in c.attributeLocations ) gl.disableVertexAttribArray(c.attributeLocations[key])

  gl.useProgram(null)
}

export function createCommand ( gl: GL, cfg: Config ): Either<Command> {
  return flatMap(fromSource(gl, cfg.vsrc, cfg.fsrc),            program => 
         flatMap(createUniforms(gl, program, cfg.uniforms),     uniforms =>
         flatMap(createAttributes(gl, program, cfg.attributes), attributes => {
         return new Success({ program, uniforms, attributes, count: cfg.count })})))
         // flatMap(locateUniforms(gl, program, uniforms),            uniformLocations => 
         // flatMap(locateAttributes(gl, program, attributes),        attributeLocations =>
         // flatMap(setupBuffers(gl, attributes, attributeLocations), buffers => {
         //   for ( const key in uniforms )   setUniform(gl, uniformLocations[key], uniforms[key])
         //   for ( const key in attributes ) setAttribute(gl, attributeLocations[key], buffers[key], attributes[key]) 
         //   return new Success({ program, uniforms, attributes, uniformLocations, attributeLocations, buffers, count })}))))
}

function createUniforms ( gl: GL, program: WebGLProgram, uniforms: Block<UniformConfig> ): Either<Block<Uniform>> {
  const out: Block<Uniform> = {}

  for ( const name in uniforms ) {
    const kind = uniforms[name].kind
    const loc = gl.getUniformLocation(program, name) 

    if ( loc == null ) return new Failure(`Could not find location for ${ name }`)
    else               out[name] = { loc, kind }
  } 
  return new Success(out)
}

function createAttributes ( gl: GL, program: WebGLProgram, attributes: Block<AttributeConfig> ): Either<Block<Attribute>> {
  const out: Block<Attribute> = {}

  for ( const name in attributes ) {
    const { kind, size, offset = 0, stride = 0 } = attributes[name]
    const loc = gl.getAttribLocation(program, name) 
    const glType = mapToGLType(gl, kind)
    const buffer = gl.createBuffer()

    if ( loc == null ) return new Failure(`Could not find attribute ${ name }`)
    if ( buffer == null ) return new Failure('Could not create buffer')

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(loc, size, glType, false, stride, offset)
    gl.enableVertexAttribArray(loc)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    out[name] = { kind, loc, buffer }
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

// function setUniform (gl: GL, loc: WebGLUniformLocation, uniform: Uniform) {
//   switch ( uniform.kind ) {
//     case UniformType.F:    return gl.uniform1f(loc, uniform.value) 
//     case UniformType.F2:   return gl.uniform2f(loc, uniform.value[0], uniform.value[1]) 
//     case UniformType.F3:   return gl.uniform3f(loc, uniform.value[0], uniform.value[1], uniform.value[2])
//     case UniformType.F4:   return gl.uniform4f(loc, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
//     case UniformType.I:    return gl.uniform1i(loc, uniform.value)
//     case UniformType.I2:   return gl.uniform2i(loc, uniform.value[0], uniform.value[1])
//     case UniformType.I3:   return gl.uniform3i(loc, uniform.value[0], uniform.value[1], uniform.value[2])
//     case UniformType.I4:   return gl.uniform4i(loc, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3])
//     case UniformType.FV:   return gl.uniform1fv(loc, uniform.value)
//     case UniformType.FV2:  return gl.uniform2fv(loc, uniform.value)
//     case UniformType.FV3:  return gl.uniform3fv(loc, uniform.value)
//     case UniformType.FV4:  return gl.uniform4fv(loc, uniform.value)
//     case UniformType.IV:   return gl.uniform1iv(loc, uniform.value)
//     case UniformType.IV2:  return gl.uniform2iv(loc, uniform.value)
//     case UniformType.IV3:  return gl.uniform3iv(loc, uniform.value)
//     case UniformType.IV4:  return gl.uniform4iv(loc, uniform.value)
//     case UniformType.MAT2: return gl.uniformMatrix2fv(loc, false, uniform.value)
//     case UniformType.MAT3: return gl.uniformMatrix3fv(loc, false, uniform.value)
//     case UniformType.MAT4: return gl.uniformMatrix4fv(loc, false, uniform.value)
//     default:               const check: never = uniform
//                            return check
//   }
// }
// 
// // TODO: Not really correct.  byte and short ( int ) handling is not handled properly
// function setAttribute (gl: GL, loc: WebGLAttributeLocation, buffer: WebGLBuffer, attribute: Attribute) {
//   const { value } = attribute
//   const content = value instanceof Float32Array ? value : new Float32Array(value)
// 
//   gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
//   gl.bufferData(gl.ARRAY_BUFFER, content, gl.DYNAMIC_DRAW)
//   gl.enableVertexAttribArray(loc)
// }

function compileShader ( gl: GL, kind: number, src: string ): Either<WebGLShader> {
  const shader = gl.createShader(kind)
  const kindStr = kind === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'

  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader && gl.getShaderParameter(shader, gl.COMPILE_STATUS) 
    ? new Success(shader) 
    : new Failure(`${ kindStr }: ${ gl.getShaderInfoLog(shader) || '' }`)
}

function linkProgram ( gl: GL, vertex: WebGLShader, fragment: WebGLShader ): Either<WebGLProgram> {
  const program = gl.createProgram()

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.useProgram(program)
  return program && gl.getProgramParameter(program, gl.LINK_STATUS) 
    ? new Success(program) 
    : new Failure(gl.getProgramInfoLog(program) || '')
}

function fromSource ( gl: GL, vsrc: ShaderSrc, fsrc: ShaderSrc ): Either<WebGLProgram> {
  return flatMap(compileShader(gl, gl.VERTEX_SHADER, vsrc),   vertex =>
         flatMap(compileShader(gl, gl.FRAGMENT_SHADER, fsrc), fragment =>
         linkProgram(gl, vertex, fragment)))
}
