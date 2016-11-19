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

export type Outcome<A> = IResult<A> | Err

export type Parser<A> = (s: string) => Outcome<A>

export function unit<A> (a: A): Parser<A> {
  return (s: string) => new Result(a, s)
}

export function failed (msg: string): Parser<string> {
  return (_: string) => new Err(msg)
}

export function fmap<A, B> (f: (a: A) => B, pa: Parser<A>): Parser<B> {
  return flatMap(pa, a => unit(f(a)))
}

export function apply<A, B> (pf: Parser<(a: A) => B>, pa: Parser<A>): Parser<B> {
  return flatMap(pf, f => fmap(f, pa))
}

export function lift<A, B> (f: (a: A) => B, pa: Parser<A>): Parser<B> {
  return apply(unit(f), pa)
}

export function lift2<A, B, C> (f: (a: A, b: B) => C, pa: Parser<A>, pb: Parser<B>): Parser<C> {
  return apply(fmap((a: A) => (b: B) => f(a, b), pa), pb)
}

export function lift3<A, B, C, D> 
(f: (a: A, b: B, c: C) => D, pa: Parser<A>, pb: Parser<B>, pc: Parser<C>): Parser<D> {
  const chain = (a: A) => (b: B) => (c: C) => f(a, b, c)

  return apply(apply(fmap(chain, pa), pb), pc)
}

export function lift4<A, B, C, D, E> (f: (a: A, b: B, c: C, d: D) => E, pa: Parser<A>, pb: Parser<B>, pc: Parser<C>, pd: Parser<D>): Parser<E> {
  const chain = (a: A) => (b: B) => (c: C) => (d: D) => f(a, b, c, d)

  return apply(apply(apply(fmap(chain, pa), pb), pc), pd)
}

export function flatMap<A, B> (pa: Parser<A>, f: (a: A) => Parser<B>): Parser<B> {
  return function (s: string): Outcome<B> {
    const out = pa(s)

    return out.success
      ? f(out.val)(out.rest)
      : new Err(out.message)
  }
}

export function doThen<A, B> (p1: Parser<A>, p2: Parser<B>): Parser<B> {
  return flatMap(p1, _ => p2)
}
