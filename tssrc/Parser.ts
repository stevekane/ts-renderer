export interface IResult<A> {
  success: true
  val: A
  rest: string
}

export interface IErr {
  success: false
  message: string
}

export class Result<A> implements IResult<A> {
  success: true = true
  constructor(public val: A, public rest: string) {} 
}

export class Err implements IErr {
  success: false = false
  constructor(public message: string) {}
}

export type Parser<A> = (s: string) => IResult<A> | IErr

export function unit<A> (a: A): Parser<A> {
  return (s: string) => new Result(a, s)
}

export function fmap<A, B> (f: (a: A) => B, pa: Parser<A>): Parser<B> {
  return flatMap(pa, a => unit(f(a)))
}

export function flatMap<A, B> (pa: Parser<A>, f: (a: A) => Parser<B>): Parser<B> {
  return (s: string): IResult<B> | IErr => {
    const out = pa(s)

    switch (out.success) {
      case true:  return f(out.val)(out.rest)
      case false: return new Err(out.message) 
    }
  }
}

export function doThen<A, B> (p1: Parser<A>, p2: Parser<B>): Parser<B> {
  return flatMap(p1, _ => p2)
}

export function satisfy (f: (s: string) => boolean): Parser<string> {
  return function (str: string): IResult<string> | IErr { 
    return str.length > 0 
      ? f(str.slice(0, 1)) 
        ? new Result(str.slice(0, 1), str.slice(1)) 
        : new Err(`${ f.name } did not pass at ${ str }`)
      : new Err('Nothing further to consume')
  }
}

export function or<A> (p1: Parser<A>, p2: Parser<A>): Parser<A> {
  return function (s: string): IResult<A> | IErr {
    const left = p1(s)

    return left.success ? left : p2(s)
  }
}

export function many<A> (p: Parser<A>): Parser<A[]> {
  return or(flatMap(p, x => flatMap(many(p), xs => unit([ x ].concat(xs)))), unit([]))
}

export function manyStr<A> (p: Parser<A>): Parser<string> {
  return or(flatMap(p, x => flatMap(manyStr(p), xs => unit(x + xs))), unit(''))
}

// TODO: imperative.  go more this direction or refactor?
export function match (target: string): Parser<string> {
  return function (s: string): IResult<string> | IErr {
    for ( var i = 0; i < target.length; i++ ) {
      if ( s[i] !== target[i] ) return new Err(`${ s[i] } is NOT ${ target[i] } in ${ s }`)
    }
    return new Result(s.slice(0, target.length), s.slice(target.length)) 
  }
}

export function consumeThen<A, B> (p1: Parser<A>, p2: Parser<B>): Parser<B> {
  return flatMap(p1, _ => p2)
}
