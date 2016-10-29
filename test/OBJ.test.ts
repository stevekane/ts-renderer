import * as test from 'tape'
import { Parser, unit, failed, flatMap } from '../src/Parsers/Parser'
import { real } from '../src/Parsers/parsers'
import { Vert, TexCoord, Line, vertex, texCoord } from '../src/Parsers/OBJ'

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
