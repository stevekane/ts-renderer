import { Mat4, Vec3 } from '../Matrix'

export interface ILookAtCamera {
  position: Vec3
  view: Mat4
  projection: Mat4
  vfov: number
  aspectRatio: number
  near: number
  far: number

  up: Vec3
  at: Vec3
}
