import * as test from 'tape'
import { Vert, Line, vertex } from '../src/Parsers/OBJ'

test('vertex', t => {
  const vstr = 'v 1.1 2.2 3.3'
  const vstrw = 'v 1.0 1.0 1.0 1.0'

  t.same(vertex(vstr), { success: true, rest: '', val: Vert(1.1, 2.2, 3.3, 1.0) })
  t.end()
})
