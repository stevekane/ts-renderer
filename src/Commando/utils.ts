import { Floats, Ints } from './GLTypes'

export function asF32 ( t: Floats ): Float32Array {
  return t instanceof Float32Array ? t : new Float32Array(t)
}

export function asI32 ( t: Ints ): Int32Array {
  return t instanceof Int32Array ? t : new Int32Array(t)
}

export function toError<T> ( s: string, v: T | null ): T | Error {
  return v == null ? new Error(s) : v
}

