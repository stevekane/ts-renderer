import * as test from 'tape'
import { flatMap } from '../src/Parsers/Parser'
import { 
  or, between, around, until
} from '../src/Parsers/combinators'
import { 
  eof, size, satisfy, match, consume, atleastN, many,
  alpha, alphas, num, nums, alphanum, alphanums, space, spaces,
  integer
} from '../src/Parsers/parsers'
import {
  is
} from '../src/Parsers/predicates'

test('eof', t => {
  t.same(eof(''), { success: true, rest: '', val: null })
  t.same(eof('\n'), { success: false, message: '\n: Not end of input'})
  t.same(eof('foo'), { success: false, message: 'foo: Not end of input'})
  t.end()
})

test('size', t => {
  t.same(num('ba'), { success: false, message: 'b did not satisfy' })
  t.same(num('1ab2'), { success: true, rest: 'ab2', val: '1' })
  t.same(size('123'), { success: true, rest: '123', val: 3 })
  t.end()
})

test('satisfy', t => {
  t.same(satisfy(is('b'))('babd'), { success: true, rest: 'abd', val: 'b' })
  t.same(satisfy(is('b'))('abd'), { success: false, message: 'a did not satisfy' })
  t.end()
})

test('match', t => {
  t.same(match('foo')('foobar'), { success: true, rest: 'bar', val: 'foo' })
  t.same(match('foo')('fauxbar'), { success: false, message: 'a did not match o' })
  t.end()
})

test('consumption', t => {
  t.same(consume(is('a'))('aab'), { success: true, rest: 'b', val: 'aa' })
  t.same(atleastN(2, is('a'))('aab'), { success: true, rest: 'b', val: 'aa' })
  t.same(atleastN(3, is('a'))('aab'), { success: false, message: 'b did not satisfy' })
  t.same(atleastN(3, is('a'))('aa'), { success: false, message: 'Not enough characters' })
  t.same(atleastN(-3, is('a'))('aab'), { success: false, message: 'Negative count' })
  t.end()
})

test('alpha', t => {
  t.same(alpha('1abcd'), { success: false, message: '1 did not satisfy' })
  t.same(alpha('abcd123'), { success: true, rest: 'bcd123', val: 'a' })

  t.same(alphas('abcd123'), { success: true, rest: '123', val: 'abcd' })
  t.same(alphas('abc'), { success: true, rest: '', val: 'abc' })
  t.end()
})

test('num', t => {
  t.same(num('1abcd'), { success: true, rest: 'abcd', val: '1' })
  t.same(num('abcd123'), { success: false, message: 'a did not satisfy' })

  t.same(nums('123abc'), { success: true, rest: 'abc', val: '123' })
  t.same(nums('abc'), { success: true, rest: 'abc', val: '' })
  t.end()
})

test('alphanum', t => {
  t.same(alphanum('1abcd'), { success: true, rest: 'abcd', val: '1' })
  t.same(alphanum('%abcd123'), { success: false, message: '% did not satisfy' })

  t.same(alphanums('123abc'), { success: true, rest: '', val: '123abc' })
  t.same(alphanums('a1b4%'), { success: true, rest: '%', val: 'a1b4' })
  t.end()
})

test('space', t => {
  t.same(space(' 1abcd'), { success: true, rest: '1abcd', val: ' ' })
  t.same(space('%asf 1'), { success: false, message: '% did not satisfy' })

  t.same(spaces('   abcd'), { success: true, rest: 'abcd', val: '   ' })
  t.same(spaces('  '), { success: true, rest: '', val: '  ' })
  t.end()
})

test('integer', t => {
  t.same(integer('1a'), { success: true, rest: 'a', val: '1' })
  t.same(integer('-1abd'), { success: true, rest: 'abd', val: '-1' })
  t.end()
})

test('many', t => {
  t.same(many(num)('123'), { success: true, rest: '', val: [ '1', '2', '3' ] })
  t.same(many(alpha)('abc'), { success: true, rest: '', val: [ 'a', 'b', 'c' ] })
  t.same(many(space)('   '), { success: true, rest: '', val: [ ' ', ' ', ' ' ] })
  t.same(many(alpha)('abc123'), { success: true, rest: '123', val: [ 'a', 'b', 'c' ] })
  t.same(many(integer)('1'), { success: true, rest: '', val: [ '1' ] })
  t.end()
})