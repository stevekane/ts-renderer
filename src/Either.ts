export interface ISuccess<T> { 
  success: true 
  value: T
}

export interface IFailure { 
  success: false
  value: string
}

export class Success<T> implements ISuccess<T> {
  success: true = true
  constructor(public value: T) {}
}

export class Failure implements IFailure {
  success: false = false
  constructor(public value: string) {}
}

export type Either<S> = IFailure | ISuccess<S>

export function fmap<A, B> (fn: (a: A) => B, mA: Either<A>): Either<B> {
  switch ( mA.success ) {
    case true:  return new Success(fn(mA.value)) 
    case false: return new Failure(mA.value)
  }
}

export function flatMap<A, B> (mA: Either<A>, fn: (a: A) => Either<B>): Either<B> {
  switch ( mA.success ) {
    case true:  return fn(mA.value)
    case false: return new Failure(mA.value)
  } 
}

export function unit<A> (a: A): Either<A> {
  return new Success(a)
}
