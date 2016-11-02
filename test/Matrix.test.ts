import { V3, M4, Q, identity, fromRotationTranslation, lookAt } from '../src/Matrix'

const pos = V3(0, 0, -1)
const rot = Q(0, 0, 0, 1)
const m1 = fromRotationTranslation(M4(), rot, pos)

const eye = V3(0, 0, -1)
const center = V3(0, 0, 0)
const up = V3(0, 1, 0)
const m2 = lookAt(M4(), eye, center, up)

console.log(m1)
console.log(m2)
