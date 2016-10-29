import { isAlpha, isNumber } from './predicates'
import { Outcome, Result, Err, Parser, flatMap, doThen, fmap, unit, failed } from './Parser'

export function satisfy (f: (s: string) => boolean): Parser<string> {
  return function (str: string): Outcome<string> { 
    if      ( str.length === 0 )   return new Err('Nothing to consume')
    else if ( f(str.slice(0, 1)) ) return new Result(str.slice(0, 1), str.slice(1))
    else                           return new Err(`${ str[0] } did not satisfy`)
  }
}

export function exactly (character: string): Parser<string> {
  return satisfy(n => n === character)
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

export function consume1 (f: (s: string) => boolean): Parser<string> {
  return flatMap(satisfy(f),           x =>
         flatMap(consume(f), xs =>
         unit(x + xs)))
}

export function many<A> (p: Parser<A>): Parser<A[]> {
  return or(many1(p), unit([]))
}

export function many1<A> (p: Parser<A>): Parser<A[]> {
  return flatMap(p,        x =>
         flatMap(many(p), xs =>
         unit([ x, ...xs ])))
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

export function seperatedBy<A, B> (p: Parser<A>, sep: Parser<B>): Parser<A[]> {
  return flatMap(p,                     first =>
         flatMap(many1(doThen(sep, p)), inner =>
         unit([ first, ...inner ])))
}

export function between<A, B, C> (pLeft: Parser<A>, p: Parser<B>, pRight: Parser<C>): Parser<B> {
  return flatMap(doThen(pLeft, p), out =>
         flatMap(pRight,           _   => 
         unit(out)))
}

export function around<A, B, C> (pLeft: Parser<A>, p: Parser<B>, pRight: Parser<C>): Parser<[ A, C ]> {
  return flatMap(pLeft,  l => 
         doThen(p, 
         flatMap(pRight, r => 
         unit([ l, r ] as [ A, C ]))))
}

export function orDefault<A> (p: Parser<A>, dflt: A): Parser<A> {
  return or(p, unit(dflt))
}

export function or<A> (p1: Parser<A>, p2: Parser<A>): Parser<A> {
  return function (s: string): Outcome<A> {
    const left = p1(s)

    return left.success ? left : p2(s)
  }
}

export function anyOf ([ head, ...rest ]: Parser<string>[]): Parser<string> {
  if ( head == null ) return failed('None matched')
  else                return or(head, anyOf(rest))
}

export function concat ([ head, ...rest ]: Parser<string>[]): Parser<string> {
  if ( head == null ) return unit('')
  else                return flatMap(head,          out =>
                             flatMap(concat(rest), out2 =>
                             unit(out + out2)))
}

export const dash = exactly('-')
export const dot = exactly('.')
export const slash = exactly('/')
export const backslash = exactly('\\')
export const alpha = satisfy(isAlpha)
export const num = satisfy(isNumber)
export const alphanum = satisfy(n => isNumber(n) || isAlpha(n))
export const alphas = consume(isAlpha)
export const nums = consume(isNumber)
export const alphanums = consume(n => isNumber(n) || isAlpha(n))
export const space = exactly(' ') 
export const spaces = consume(n => n === ' ')
export const integer = concat([ orDefault(dash, ''), atleastN(1, isNumber) ])
export const real = concat([ integer, dot, atleastN(1, isNumber) ])
