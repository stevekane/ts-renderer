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
