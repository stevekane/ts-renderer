type Block<T> = { [ x: string ]: T }
type V2 = [ number, number ]
type GL = { webgl: boolean }
type UniformCfgs<T> = { [ P in keyof T ]: IUniformCfg<T[P]> }
type Uniforms<T> = { [ P in keyof T ]: IUniform<T[P]> }

interface ILoc { loc: number }
interface ISettable<H, T> { set( gl: GL, h: H, t: T ): void }
interface IBox<T> { value: T }
interface IUniformCfg<T> extends ISettable<GLUniformLocation, T>, IBox<T> {}
interface IUniform<T> extends IUniformCfg<T>, ILoc {}

interface ICommandCfg<U> {
  uniforms: UniformCfgs<U>
}

interface ICommand<U> {
  uniforms: Uniforms<U>
}

class UF implements IUniformCfg<number> { 
  constructor( public value: number ) {}
  set( gl: GL, h: GLUniformLocation, t: number ) {
    console.log(`Setting Float: ${ t } to Location: ${ h }`) 
  }
}

class UF2V implements IUniformCfg<V2> { 
  constructor( public value: V2 ) {}
  set( gl: GL, h: GLUniformLocation, [ x, y ]: V2 ) {
    console.log(`Setting x: ${ x }, y: ${ y } to Location: ${ h }`) 
  }
}

class Command<U> implements ICommand<U> {
  gl: GL
  program: GLProgram
  uniforms: Uniforms<U>
  constructor( gl: GL, p: GLProgram, cfg: ICommandCfg<U> ) {
    this.gl = gl
    this.program = p
    this.uniforms = locate(gl, p, cfg.uniforms)
  }
}

function locate<T> ( gl: GL, p: GLProgram, ucfgs: UniformCfgs<T> ): Uniforms<T> {
  const out = {} as Uniforms<T>

  for ( const key in ucfgs ) {
    const { value, set } = ucfgs[key]

    out[key] = { value, set, loc: 0 }
  }
  return out
}
