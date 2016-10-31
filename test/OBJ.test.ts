import * as test from 'tape'
import { Parser, unit, failed, flatMap, Err, Result } from '../src/Parsers/Parser'
import { real } from '../src/Parsers/parsers'
import { 
  IFaceVertex,
  Vert, TexCoord, Normal, Face,
  vertex, texCoord, normal, face
} from '../src/Parsers/OBJ'

test('vertex', t => {
  const vstr = 'v 1.1 2.2 3.3'
  const vstrw = 'v 1.0 -1.0 1.0 1.0'

  t.same(vertex(vstr), { success: true, rest: '', val: Vert(1.1, 2.2, 3.3, 1.0) })
  t.same(vertex(vstrw), { success: true, rest: '', val: Vert(1.0, -1.0, 1.0, 1.0) })
  t.end()
})

test('texCoord', t => {
  const txstr = 'vt 1.0 0.5'
  const txstrw = 'vt 1.0 0.5 0.5'
  const txBad = 'vt 2.0 1.0'

  t.same(texCoord(txstr), { success: true, rest: '', val: TexCoord(1.0, 0.5, 0.0) })
  t.same(texCoord(txstrw), { success: true, rest: '', val: TexCoord(1.0, 0.5, 0.5) })
  t.same(texCoord(txBad), { success: false, message: 'Out of range' })
  t.end()
})

test('normal', t => {
  const nstr = 'vn 1.0 8.0 9.01'
  const nbad = 'vnt 1.0 1.0 1.0'
  const nbad2 = 'vn 1.0 1.0'
  const nbad3 = 'vn 1 1 1'

  t.same(normal(nstr), new Result(Normal(1.0, 8.0, 9.01), ''))
  t.same(normal(nbad), new Err('t did not satisfy'))
  t.same(normal(nbad2), new Err('Not enough characters'))
  t.same(normal(nbad3), new Err('  did not satisfy'))
  t.end()
})

test('face', t => {
  const FV = (v: number): IFaceVertex => 
    ({ v, vt: undefined, vn: undefined })
  const FVT = (v: number, vt: number): IFaceVertex => 
    ({ v, vt, vn: undefined })
  const FVN = (v: number, vn: number): IFaceVertex => 
    ({ v, vn, vt: undefined })
  const FVTN = (v: number, vt: number, vn: number): IFaceVertex => 
    ({ v, vt, vn })
  const nstr1 = 'f 1 2 3'
  const nstr2 = 'f 1 1 1 1'
  const nstr3 = 'f 1/1 2/2 3/3'
  const nstr4 = 'f 1/1/1 2/2/2 3/3/3'
  const nstr5 = 'f 1//1 2//2 3//3'

  t.same(face(nstr1), new Result(Face([ FV(1), FV(2), FV(3) ]), ''))
  t.same(face(nstr2), new Result(Face([ FV(1), FV(1), FV(1), FV(1) ]), ''))
  t.same(face(nstr3), new Result(Face([ FVT(1,1), FVT(2,2), FVT(3,3) ]), ''))
  t.same(face(nstr4), new Result(Face([ FVTN(1,1,1), FVTN(2,2,2), FVTN(3,3,3) ]), ''))
  t.same(face(nstr5), new Result(Face([ FVN(1,1), FVN(2,2), FVN(3,3) ]), ''))
  t.end()
})
