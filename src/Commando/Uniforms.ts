import { GL, Loc, Floats, Ints } from './GLTypes'
import { asF32, asI32 } from './utils'

export type UniformCfgs<T> = { [ P in keyof T ]: IUniformCfg<T[P]> }
export type Uniforms<T> = { [ P in keyof T ]: IUniform<T[P]> }

export interface IUniformCfg<T> { 
  value: T
  set<T>( gl: GL, h: WebGLUniformLocation, t: T): void
}

export interface IUniform<T> extends IUniformCfg<T> { 
  loc: WebGLUniformLocation
}

export class UF implements IUniformCfg<number> {
  constructor( public value: number ) {}
  set( gl: GL, h: Loc, t: number ) { gl.uniform1f(h, t) }
}

export class U2F implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform2f(h, t[0], t[1]) }
}

export class U3F implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform3f(h, t[0], t[1], t[2]) }
}

export class U4F implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform4f(h, t[0], t[1], t[2], t[3]) }
}

export class UI implements IUniformCfg<number> {
  constructor( public value: number ) {}
  set( gl: GL, h: Loc, t: number ) { gl.uniform1i(h, t) }
}

export class U2I implements IUniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform2i(h, t[0], t[1]) }
}

export class U3I implements IUniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform3i(h, t[0], t[1], t[2]) }
}

export class U4I implements IUniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform4i(h, t[0], t[1], t[2], t[3]) }
}

export class UFV implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform1fv(h, asF32(t)) }
}

export class U2FV implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform2fv(h, asF32(t)) }
}

export class U3FV implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform3fv(h, asF32(t)) }
}

export class U4FV implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniform4fv(h, asF32(t)) }
}

export class UIV implements IUniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform1iv(h, asI32(t)) }
}

export class U2IV implements IUniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform2iv(h, asI32(t)) }
}

export class U3IV implements IUniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform3iv(h, asI32(t)) }
}

export class U4IV implements IUniformCfg<Ints> {
  constructor( public value: Ints ) {}
  set( gl: GL, h: Loc, t: Ints ) { gl.uniform4iv(h, asI32(t)) }
}

export class UMatrix2 implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniformMatrix2fv(h, false, asF32(t)) }
}

export class UMatrix3 implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniformMatrix3fv(h, false, asF32(t)) }
}

export class UMatrix4 implements IUniformCfg<Floats> {
  constructor( public value: Floats ) {}
  set( gl: GL, h: Loc, t: Floats ) { gl.uniformMatrix4fv(h, false, asF32(t)) }
}
