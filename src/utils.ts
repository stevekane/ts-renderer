export function containing ( b: ArrayBuffer, offset: number, length: number, value: number[] ): Float32Array {
  const out = new Float32Array(b, offset, length)

  out.set(value)
  return out
}
