import { Parser, flatMap, unit, IResult, IErr } from './Parser'

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

export function consumeThen<A, B> (p1: Parser<A>, p2: Parser<B>): Parser<B> {
  return flatMap(p1, _ => p2)
}

export function thenConsume<A, B> (p1: Parser<A>, p2: Parser<B>): Parser<A> {
  return flatMap(p1, out => flatMap(p2, _ => unit(out)))
}

export function between<A, B, C> (pLeft: Parser<A>, p: Parser<B>, pRight: Parser<C>): Parser<B> {
  return flatMap(consumeThen(pLeft, p), out =>
         flatMap(pRight,                _   => 
         unit(out)))
}

export function around<A, B, C> (pLeft: Parser<A>, p: Parser<B>, pRight: Parser<C>): Parser<[ A, C ]> {
  return flatMap(pLeft,  l => 
         consumeThen(p, 
         flatMap(pRight, r => 
         unit([ l, r ] as [ A, C ]))))
}

export function until<A, B> (pEnd: Parser<B>, p: Parser<A>): Parser<A[]> {
  return or(flatMap(pEnd, _ => unit([])), many(p))
}
