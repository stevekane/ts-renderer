import { isAlpha, isNumber, is } from './predicates'
import { Outcome, Result, Err, Parser, flatMap, fmap, unit } from './Parser'
import { or, concat } from './combinators'

export function satisfy (f: (s: string) => boolean): Parser<string> {
  return function (str: string): Outcome<string> { 
    if      ( str.length === 0 )   return new Err('Nothing to consume')
    else if ( f(str.slice(0, 1)) ) return new Result(str.slice(0, 1), str.slice(1))
    else                           return new Err(`${ str[0] } did not satisfy`)
  }
}

export function match (target: string): Parser<string> {
  return function (s: string): Outcome<string> {
    for ( var i = 0; i < target.length; i++ ) {
      if ( s[i] !== target[i] ) return new Err(`${ s[i] } did not match ${ target[i] }`)
    }
    return new Result(s.slice(0, target.length), s.slice(target.length)) 
  }
}

export function size (s: string): Outcome<number> {
  return new Result(s.length, s)
}

export function eof (s: string): Outcome<null> {
  return s.length === 0 ? new Result(null, '') : new Err(s + ': Not end of input')
}

export function consume (f: (s: string) => boolean): Parser<string> {
  return function (s: string): Outcome<string> {
    for ( var i = 0; i < s.length; i++) {
      if ( !f(s[i]) ) break
    }
    return new Result(s.slice(0, i), s.slice(i))
  }
}

export function atleastN (n: number, f: (s: string) => boolean): Parser<string> {
  return function (s: string): Outcome<string> {
    if ( n < 0 )        return new Err('Negative count')
    if ( s.length < n ) return new Err('Not enough characters')

    for ( var i = 0; i < n; i++ ) {
      if ( !f(s[i]) ) return new Err(`${ s[i] } did not satisfy`)
    }
    return consume(f)(s)
  }
}

export function many<A> (p: Parser<A>): Parser<A[]> {
  return or(many1(p), unit([]))
}

export function many1<A> (p: Parser<A>): Parser<A[]> {
  return flatMap(p,        x =>
         flatMap(many(p), xs =>
         unit([ x, ...xs ])))
}

const dash = satisfy(is('-'))
const optionalDash = or(dash, unit(''))

export const alpha = satisfy(isAlpha)
export const num = satisfy(isNumber)
export const alphanum = satisfy(n => isNumber(n) || isAlpha(n))
export const alphas = consume(isAlpha)
export const nums = consume(isNumber)
export const alphanums = consume(n => isNumber(n) || isAlpha(n))
export const space = satisfy(is(' '))
export const spaces = consume(is(' '))
export const integer = concat([ optionalDash, atleastN(1, isNumber) ])
