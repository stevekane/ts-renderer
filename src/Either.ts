export interface ISuccess<T> { 
  success: true 
  value: T
}

export interface IFailure<T> { 
  success: false
  value: T
}

export class Success<T> implements ISuccess<T> {
  success: true = true
  constructor(public value: T) {}
}

export class Failure<T> implements IFailure<T> {
  success: false = false
  constructor(public value: T) {}
}

export type Either<F, S> = IFailure<F> | ISuccess<S>

export function fmap<A, B, L> (fn: (a: A) => B, mA: Either<L, A>): Either<L, B> {
  switch ( mA.success ) {
    case true:  return new Success(fn(mA.value)) 
    case false: return new Failure(mA.value)
  }
}

export function flatMap<A, B, L> (mA: Either<L, A>, fn: (a: A) => Either<L, B>): Either<L, B> {
  switch ( mA.success ) {
    case true:  return fn(mA.value)
    case false: return new Failure(mA.value)
  } 
}

export function unit<L, A> (a: A): Either<L, A> {
  return new Success(a)
}
