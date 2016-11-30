import { GL, Loc, Floats, Ints } from './GLTypes'
import { asF32, asI32 } from './utils'

export interface UniformCfg<T> { 
  value: T
  set<T>( gl: GL, h: WebGLUniformLocation, t: T): void
}

export interface Uniform<T> extends UniformCfg<T> { 
  loc: WebGLUniformLocation
}

export type UniformCfgs<T> = { [ P in keyof T ]: UniformCfg<T[P]> }
export type Uniforms<T> = { [ P in keyof T ]: Uniform<T[P]> }

export class UF implements UniformCfg<number> {
  constructor( public value: number ) {}
  set( gl: GL, h: Loc, t: number ) { gl.uniform1f(h, t) }
}

export class U2F implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform2f(h, t[0], t[1]) }
}

export class U3F implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform3f(h, t[0], t[1], t[2]) }
}

export class U4F implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform4f(h, t[0], t[1], t[2], t[3]) }
}

export class UI implements UniformCfg<number> {
  constructor( public value: number ) {}
  set( gl: GL, h: Loc, t: number ) { gl.uniform1i(h, t) }
}

export class U2I implements UniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform2i(h, t[0], t[1]) }
}

export class U3I implements UniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform3i(h, t[0], t[1], t[2]) }
}

export class U4I implements UniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform4i(h, t[0], t[1], t[2], t[3]) }
}

export class UFV implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform1fv(h, asF32(t)) }
}

export class U2FV implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform2fv(h, asF32(t)) }
}

export class U3FV implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform3fv(h, asF32(t)) }
}

export class U4FV implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform4fv(h, asF32(t)) }
}

export class UIV implements UniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform1iv(h, asI32(t)) }
}

export class U2IV implements UniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform2iv(h, asI32(t)) }
}

export class U3IV implements UniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform3iv(h, asI32(t)) }
}

export class U4IV implements UniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform4iv(h, asI32(t)) }
}

export class UMatrix2 implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniformMatrix2fv(h, false, asF32(t)) }
}

export class UMatrix3 implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniformMatrix3fv(h, false, asF32(t)) }
}

export class UMatrix4 implements UniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniformMatrix4fv(h, false, asF32(t)) }
}
