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
  return (s: string) => new Err(msg)
}

export function fmap<A, B> (f: (a: A) => B, pa: Parser<A>): Parser<B> {
  return flatMap(pa, a => unit(f(a)))
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
