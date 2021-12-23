import * as fpjs from './index.mjs'
for (const [k, v] of Object.entries(fpjs))
	globalThis[k] = v

import assert from 'assert/strict'

function Test(name, cb) {
	try {
		cb()
	} catch(e) {
		console.error('test failed for', name)
		console.error(e)
	}
}
Test('tap', () => {
	assert.deepEqual({ x: 1, y: 2 }, tap(x => x.y = 2)({ x: 1 }))
})
Test('pipe', () => {
	assert.equal(10, pipe(1, x => x*10, x => ''+x, parseFloat))
})
Test('arrow', () => {
	assert.equal(10, arrow(x => x*10, x => ''+x, parseFloat)(1))
})
Test('curry', () => {
	const add = (a,b) => a+b
	assert.equal(add(1, 2), curry(add)(1)(2))
})
Test('do_nothing', () => {
	assert.equal(false, do_nothing())
})
Test('waterfall', () => {
	const add = (a, b, f) => f(a+b)
	waterfall(
		f => add(1, 2, f),
		(f, x) => add(x, 2, f),
		(f, x) => add(x, 5, f),
		(f, x) => assert.equal(10, x)
	)
})
Test('bind', () => {
	const arr = [1,2,3]
	const inc = x => x + 1
	assert.deepEqual(arr.map(inc), bind(arr.map)(arr)(inc))
})
Test('get', () => {
	const x = [
		{ val: new Map([[ 'yo', 'lo' ]]) },
		1,
		2
	]

	assert.equal(x[0], get(0)(x))
	assert.equal(x[0].val, get(0, 'val')(x))
	assert.equal(x[0].val.get('yo'), get(0, 'val', 'yo')(x))
})
Test('set', () => {
	assert.deepEqual({ x: 1, y: 2 }, set('y')(2)({ x: 1 }))
	assert.deepEqual([0, 1], set(1)(1)([0]))
})
Test('get_from', () => {
	const x = [
		{ val: new Map([[ 'yo', 'lo' ]]) },
		1,
		2
	]

	assert.equal(x[0], get_from(x)(0))
})
Test('pluck', () => {
	const x = [1,2,3]
	assert.equal(x[0], pluck(0)(x))
	assert.equal(x[1], pluck(1)(x))
	assert.equal(x[2], pluck(2)(x))
})
Test('change', () => {
	assert.deepEqual({ a: 1, b: 2, c: 'test'}, change(parseFloat, 'a', 'b')({ a: '1', b: '2', c: 'test'}))
})
Test('update', () => {
	assert.deepEqual({ a: 1, b: 2, c: 'test'}, update({ c: 'test' })({ a: 1, b: 2 }))
})
Test('object_map', () => {
	assert.deepEqual({ a_test: 2, b_test: 3 }, object_map(([k, v]) => [k + '_test', v+1])({ a: 1, b: 2}))
})
Test('object_filter', () => {
	assert.deepEqual({ a: 1 }, object_filter(([k, v]) => k !== 'b' && v < 2)({ a: 1, b: 1, c: 15 }))
})
Test('not', () => {
	assert.equal(!true, not(true))
	assert.equal(!false, not(false))
})
Test('and', () => {
	assert.equal(true && true, and(true)(true))
	assert.equal(true && false, and(true)(false))
	assert.equal(false && false, and(false)(false))
	assert.equal(false && true, and(false)(true))
})
Test('or', () => {
	assert.equal(true || true, or(true)(true))
	assert.equal(true || false, or(true)(false))
	assert.equal(false || false, or(false)(false))
	assert.equal(false || true, or(false)(true))
})
Test('combinations', () => {
	assert.deepEqual(
		[[1, 'red'], [1, 'blue'], [2, 'red'], [2, 'blue']],
		Array.from(combinations([1,2], ['red', 'blue']))
	)
})
Test('combinations_fn', () => {
	assert.deepEqual(
		[[1, 'red'], [1, 'blue'], [2, 'red'], [2, 'blue']],
		Array.from(combinations_fn(K([1,2]), K(['red', 'blue'])))
	)
})
Test('first', () => {
	const arr = [1,2,3]
	assert.equal(arr[0], first(arr))
})
Test('second', () => {
	const arr = [1,2,3]
	assert.equal(arr[1], second(arr))
})
Test('last', () => {
	const arr = [1,2,3]
	assert.equal(arr[2], last(arr))
})
Test('head', () => {
	const arr = [1,2,3]
	assert.deepEqual([1,2], head(arr))
})
Test('tail', () => {
	const arr = [1,2,3]
	assert.deepEqual([2,3], tail(arr))
})
Test('slice', () => {
	const arr = [1,2,3]
	assert.deepEqual([1,2,3], slice(0, 3)(arr))
	assert.deepEqual([1,2], slice(0, 2)(arr))
	assert.deepEqual([1], slice(0, 1)(arr))
	assert.deepEqual([], slice(0, 0)(arr))
	assert.deepEqual([2,3], slice(1)(arr))
})
Test('array_map', () => {
	const arr = [1,2,3]
	const inc = x => x+1
	assert.deepEqual(arr.map(inc), array_map(inc)(arr))
})
Test('array_filter', () => {
	const arr = [1,2,3]
	const even = x => x % 2 === 0
	assert.deepEqual(arr.filter(even), array_filter(even)(arr))
})
Test('array_splice', () => {
	assert.deepEqual([2,3], array_splice(1,2)([1,2,3]))
})
Test('array_take', () => {
	assert.deepEqual([1,2,3], array_take(2)([1,2,'memes',3]))
})
Test('array_get', () => {
	assert.deepEqual([1,2,3], array_get('x')([{ x: 1 }, { x: 2 }, { x: 3} ]))
})
Test('array_push', () => {
	assert.deepEqual([1,2,3], array_push(3)([1,2]))
})
Test('pick', () => {
	assert.deepEqual(typeof 1, typeof pick([1,2,3]))
})
Test('construct', () => {
	assert.deepEqual(['Number 1', 'Number 2', 'Number 3'], construct(i => 'Number ' + (i+1), 3))
})
Test('join', () => {
	assert.equal('1 2 3', join(' ')([1,2,3]))
	assert.equal('1 2 3', join(' ')('123'))
	assert.equal('1 2 3', join(' ')(new Set([1, 2, 3])))
	assert.equal('1 2 3', join(' ')(new Map([[1, 'yo'], [2, 'lo'], [3, 'swag']]).keys()))
})
Test('sort', () => {
	const lexical = (a,b) => a < b ? -1 : 1
	assert.deepEqual(['1','2','3'], sort(lexical)('321'))
	assert.deepEqual([1,2,3], sort(lexical)([3,2,1]))
	assert.deepEqual([1,2,3], sort(lexical)(new Set([3,2,1])))
	assert.deepEqual([1,2,3], sort(lexical)((function*() { yield 3; yield 2; yield 1; })()))
})
Test('reverse', () => {
	const arr = [1,2,3]
	assert.deepEqual([3,2,1], reverse(arr))
	assert.deepEqual(['3','2','1'], reverse('123'))
	assert.deepEqual([3,2,1], reverse(new Set(arr)))
})
Test('objectify', () => {
	const arr = [{ name: 'Bob', age: 25 }, { name: 'Alice', age: 26 }]
	assert.deepEqual(
		{
			Bob: { name: 'Bob', age: 25 },
			Alice: { name: 'Alice', age: 26 }
		},
		objectify(pluck('name'))(arr)
	)
})
Test('swap', () => {
	assert.deepEqual([2,1], swap([1,2], 0, 1))
})
Test('group', () => {
	const arr = [
		{ colour: 'red', size: 'm', logo: true },
		{ colour: 'red', size: 'l', logo: true },
		{ colour: 'blue', size: 'm', logo: true },
		{ colour: 'blue', size: 'l', logo: true },
		{ colour: 'blue', size: 's', logo: true },
		{ colour: 'blue', size: 's', logo: false },
	]

	assert.deepEqual(
		{
			'red': {
				'm': {
					'true': [arr[0]],
				},

				'l': {
					'true': [arr[1]],
				},
			},

			'blue': {
				'm': {
					'true': [arr[2]],
				},
				'l': {
					'true': [arr[3]],
				},
				's': {
					'true': [arr[4]],
					'false': [arr[5]],
				},
			},
		},
		group(pluck('colour'), pluck('size'), pluck('logo'))(arr)
	)
})
Test('partition', () => {
	assert.deepEqual(
		[[1], [2,4], [5]],
		partition
			(is(1), divisible(2), divisible(5))
			([1,2,3,4,5]))
})
Test('is', () => {
	assert.equal(1 === 1, is(1)(1))
	assert.equal({} === {}, is({})({}))
})
Test('like', () => {
	assert.equal(1 == 1, like(1)(1))
	assert.equal(1 == '1', like(1)('1'))
	assert.equal({} == {}, like({})({}))
})
Test('isnt', () => {
	assert.equal(1 !== 1, isnt(1)(1))
	assert.equal({} !== {}, isnt({})({}))
})
Test('null_undefined', () => {
	assert.equal(true, null_undefined(null))
	assert.equal(true, null_undefined(undefined))
	assert.equal(false, null_undefined(false))
	assert.equal(false, null_undefined(NaN))
	assert.equal(false, null_undefined({}))
})
Test('defined', () => {
	assert.equal(false, defined(null))
	assert.equal(false, defined(undefined))
	assert.equal(true, defined(false))
	assert.equal(true, defined(NaN))
	assert.equal(true, defined({}))
})
Test('AND', () => {
	assert.equal(true, AND([K(1), K(2), K(true)])())
	assert.equal(false, AND([K(false)])())
	assert.equal(true, AND([])())
})
Test('OR', () => {
	assert.equal(true, OR([K(1), K(2), K(false)])())
	assert.equal(false, OR([K(false)])())
	assert.equal(false, OR([])())
})
Test('instance', () => {
	assert.equal(1 instanceof Number, instance(Number)(1))
	assert.equal(1 instanceof String, instance(String)(1))
})
Test('equal', () => {
	const a = {
		x: [ 1, 2, new Map([['yo', 'lo']]) ]
	}

	const b = {
		x: [ 1, 2, new Map([['yo', 'lo']]) ]
	}

	const c = {
		x: [ 1, 2, new Map([['yo', 'lo'], ['swag', 420]]) ]
	}

	assert.equal(true, equal(a,b))
	assert.equal(false, equal(a,c))
})
Test('ifelse', () => {
	assert.equal(1, ifelse(Boolean)(K(1), K(2))(true))
	assert.equal(2, ifelse(Boolean)(K(1), K(2))(false))
})
Test('when', () => {
	assert.equal('test', when(Boolean)(K('test'))(true))
	assert.equal(false, when(Boolean)(K('test'))(false))
})
Test('maybeor', () => {
	assert.equal('test', maybeor(K('test'), K('best'))(true))
	assert.equal('best', maybeor(K('test'), K('best'))(null))
})
Test('maybe', () => {
	assert.equal(2, maybe(x => x + 1)(1))
	assert.equal(null, maybe(x => x + 1)(null))
})
Test('nothing', () => {
	assert.equal(2, nothing(K(2))(null))
	assert.equal(1, nothing(K(2))(1))
})
Test('success', () => {
	assert.equal(2, success(x => x + 1)(1))
	assert.equal(true, success(x => x + 1)(new Error('swag')) instanceof Error)
})
Test('failure', () => {
	assert.equal(1, failure(x => x + 1)(1))
	assert.equal('swag', failure(x => x.message)(new Error('swag')))
})
Test('trycatch', () => {
	const test = trycatch(x => x+1, x => x.message)
	assert.equal(2, test(1))
	assert.equal('hmm', test(new Error('hmm')))
})
Test('valmap', () => {
	const test = valmap(1, 'a', 2, 'b', 'no idea')
	assert.equal('a', test(1))
	assert.equal('b', test(2))
	assert.equal('no idea', test(Infinity))
})
Test('cond', () => {
	const test = cond(is(1), K('a'), is(2), K('b'), K('no idea'))
	assert.equal('a', test(1))
	assert.equal('b', test(2))
	assert.equal('no idea', test(Infinity))
})
Test('attempt', () => {
	assert.equal('test',
		attempt(function() { throw new Error('test') }).message
	)
})
Test('reject', () => {
	try {
		reject(is('Test'), K('Test'))('Test')
	} catch(e) {
		assert.equal('Test', e)
	}

	assert.equal('Best', reject(is('Test'), K('Test'))('Best'))
})
Test('between', () => {
	assert.equal(true, between(1, 0, 10))
	assert.equal(true, between(1, 1, 10))
	assert.equal(true, between(10, 1, 10))
	assert.equal(false, between(0.5, 1, 10))
	assert.equal(false, between(10.0001, 1, 10))
})
Test('cbetween', () => {
	assert.equal(true, cbetween(0, 10)(1))
	assert.equal(true, cbetween(1, 10)(1))
	assert.equal(true, cbetween(1, 10)(10))
	assert.equal(false, cbetween(1, 10)(0.5))
	assert.equal(false, cbetween(1, 10)(10.0001))
})
Test('gt', () => {
	assert.equal(1 > 2, gt(2)(1))
	assert.equal(2 > 1, gt(1)(2))
	assert.equal(2 > 2, gt(2)(2))
})
Test('gte', () => {
	assert.equal(1 >= 2, gte(2)(1))
	assert.equal(2 >= 1, gte(1)(2))
	assert.equal(2 >= 2, gte(2)(2))
})
Test('lt', () => {
	assert.equal(1 < 2, lt(2)(1))
	assert.equal(2 < 1, lt(1)(2))
	assert.equal(2 < 2, lt(2)(2))
})
Test('lte', () => {
	assert.equal(1 <= 2, lte(2)(1))
	assert.equal(2 <= 1, lte(1)(2))
	assert.equal(2 <= 2, lte(2)(2))
})
Test('pow', () => {
	assert.equal(2**3, pow(3)(2))
	assert.equal(2**0, pow(0)(2))
})
Test('mult', () => {
	assert.equal(2*2, mult(2)(2))
})
Test('div', () => {
	assert.equal(3/2, div(2)(3))
})
Test('divisible', () => {
	assert.equal(true, divisible(2)(4))
	assert.equal(true, divisible(3)(30))
	assert.equal(false, divisible(100)(101))
})
Test('add', () => {
	assert.equal(2, add(1)(1))
	assert.equal('yolo', add('yo')('lo'))
	assert.equal(null, add(1)(null))
	assert.equal(null, add(1)([1]))
	assert.deepEqual([1,2,3], add([1])([2,3]))
	assert.deepEqual({ a: 1, b: 2 }, add({ a: 1 })({ b: 2 }))

	assert.deepEqual([1,2,3], Array.from(
		add
			((function* () { yield 1 })())
			((function* () { yield 2; yield 3 })())
		)
	)
})
Test('addr', () => {
	assert.equal(2, addr(1)(1))
	assert.equal('loyo', addr('yo')('lo'))
	assert.equal(null, addr(1)(null))
	assert.equal(null, addr(1)([1]))
	assert.deepEqual([2,3,1], addr([1])([2,3]))
	assert.deepEqual({ a: 1, b: 2 }, addr({ a: 1 })({ b: 2 }))

	assert.deepEqual([1,2,3], Array.from(
		add
			((function* () { yield 1 })())
			((function* () { yield 2; yield 3 })())
		)
	)
})
Test('randint', () => {
	assert.equal(true, randint(0, 15) < 16)
})
Test('clamp', () => {
	assert.equal(5, clamp(5, 1, 10))
	assert.equal(10, clamp(999, 1, 10))
	assert.equal(1, clamp(-Infinity, 1, 10))
})
Test('ceil', () => {
	assert.equal(1, ceil(0.88))
	assert.equal(0.9, ceil(0.88, -1))
	assert.equal(10, ceil(0.88, 1))
})
Test('floor', () => {
	assert.equal(1, floor(1.88))
	assert.equal(1.8, floor(1.88, -1))
	assert.equal(0, floor(1.88, 1))
})
Test('minmax', () => {
	assert.deepEqual([1,2], minmax(2,1))
	assert.deepEqual([1,2], minmax(1,2))
})
Test('plus_mod', () => {
	assert.deepEqual(5, plus_mod(5)(4))
	assert.deepEqual(10, plus_mod(5)(5))
	assert.deepEqual(10, plus_mod(5)(6))
	assert.deepEqual(10, plus_mod(5)(7))
	assert.deepEqual(10, plus_mod(5)(8))
})
Test('rollover', () => {
	assert.equal(3, rollover(0, 3)(-1))
	assert.equal(0, rollover(0, 3)(4))
})
Test('naturals', () => {
	let i = 0
	for (const x of naturals()) {
		assert.equal(i, x)
		i++
		if (i > 10) break
	}
})
Test('Range', () => {
	const rng = new Range(0, 10)
	assert.equal(true, rng.includes(0))
	assert.equal(true, rng.includes(10))
	assert.equal(true, rng.includes(5))
	assert.equal(false, rng.includes(11))
	assert.equal(false, rng.includes(-0.01))
})
Test('probability', () => {
	assert.equal(0.01, probability(1))
})
Test('percentage', () => {
	assert.equal(1, percentage(0.01))
})
Test('signum', () => {
	assert.deepEqual([1, 0, -1], [4839720, 0, -Infinity].map(signum))
})
Test('isIterable', () => {
	assert.equal(false, isIterable(false))
	assert.equal(false, isIterable({}))
	assert.equal(true, isIterable(''))
	assert.equal(true, isIterable([]))
	assert.equal(true, isIterable(new Map()))
	assert.equal(true, isIterable(new Set()))
	assert.equal(true, isIterable((function* () {})()))
})
Test('iter', () => {
	assert.equal(true, 'next' in iter(''))
	assert.equal(true, 'next' in iter([]))
	assert.equal(true, 'next' in iter(new Map()))
	assert.equal(true, 'next' in iter(new Set()))
})
Test('inside', () => {
	assert.equal(false, inside(null)(1))
	assert.equal(true, inside('32123')('1'))
	assert.equal(true, inside([3,2,1])(1))
	assert.equal(true, inside(new Set([3,2,1]))(1))
	assert.equal(true, inside(new Map([[1, 1], [2, 2], [3, 3]]))(1))
})
Test('outside', () => {
	assert.equal(true, outside(null)(4))
	assert.equal(true, outside('32123')('4'))
	assert.equal(true, outside([3,2,1])(4))
	assert.equal(false, outside(new Set([3,2,1]))(3))
	assert.equal(true, outside(new Map([[1, 1], [2, 2], [3, 3]]))(4))
})
Test('has', () => {
	assert.equal(false, has(1)(null))
	assert.equal(true, has('1')('32123'))
	assert.equal(true, has(1)([3,2,1]))
	assert.equal(true, has(1)(new Set([3,2,1])))
	assert.equal(true, has(1)(new Map([[1, 1], [2, 2], [3, 3]])))
})
Test('hasnt', () => {
	assert.equal(true, hasnt(4)(null))
	assert.equal(true, hasnt('4')('32123'))
	assert.equal(true, hasnt(4)([3,2,1]))
	assert.equal(false, hasnt(3)(new Set([3,2,1])))
	assert.equal(true, hasnt(4)(new Map([[1, 1], [2, 2], [3, 3]])))
})
Test('find_many', () => {
	const xs = [0, 1, 2, 3, 4, 5]
	assert.deepEqual([1, 2, 5], find_many(is(1), is(2), is(5))(xs))
})
Test('empty', () => {
	assert.equal(true, empty({}))
	assert.equal(true, empty([]))
	assert.equal(true, empty(new Set()))
	assert.equal(true, empty(new Map()))
	assert.equal(false, empty({ x: 1 }))
})
Test('average', () => {
	assert.equal(2, average([1,2,3]))
	assert.equal(2, average(new Set([1,2,3])))
})
Test('next', () => {
	const it = iter([1,2,3])
	assert.equal(1, next(it))
	assert.equal(2, next(it))
	assert.equal(3, next(it))
})
Test('early', () => {
	assert.equal(null, early(is(null))([1,2,3,4,null,5,6,7]))
	assert.equal(7, early(is(null))([1,2,3,4,5,6,7]))
})
Test('unshift', () => {
	assert.deepEqual([1,2,3], Array.from(unshift([1])([2,3])))
})

Test('append', () => {
	assert.deepEqual([1,2,3], Array.from(append([2,3])([1])))
})

Test('union', () => {
	assert.deepEqual(new Set([1,2,3,4,5]), union([ new Set([1,2]), new Set([1,3]), new Set([2,3,4,5]) ]))
})
Test('duad', () => {
	assert.deepEqual([1,2], Duad(1,2))
})
Test('duad prefix', () => {
	assert.deepEqual([[1,1],[1,2],[1,3]], [1,2,3].map(Duad.prefix(1)))
})

Test('duad suffix', () => {
	assert.deepEqual([[1,1],[2,1],[3,1]], [1,2,3].map(Duad.suffix(1)))
})
Test('duad map first', () => {
	const inc = x => x+1
	assert.deepEqual([[2,1],[2,2],[2,3]], Array.from(Duad.map_first(inc)([[1,1],[1,2],[1,3]])))
})

Test('duad map second', () => {
	const inc = x => x+1
	assert.deepEqual([[1,2],[2,2],[3,2]], Array.from(Duad.map_second(inc)([[1,1],[2,1],[3,1]])))
})
Test('duad filter first', () => {
	const even = x => x % 2 === 0
	assert.deepEqual([[2,1]], Array.from(Duad.filter_first(even)([[1,1],[2,1],[3,1]])))
})

Test('duad filter second', () => {
	const even = x => x % 2 === 0
	assert.deepEqual([[1,2]], Array.from(Duad.filter_second(even)([[1,1],[1,2],[1,3]])))
})
Test('duad combine', () => {
	assert.equal(3, Duad.combine(add)([1,2]))
})
Test('duad.is', () => {
	assert.equal(true, Duad.is([1,'yo'])([1, 'yo']))
	assert.equal(false, Duad.is([1, {}])([1, {}]))
})
Test('duad.flip', () => {
    assert.deepEqual([2,1], Duad.flip([1,2]))
})
Test('split', () => {
	const x = '1 2 3'
	assert.deepEqual(x.split(' '), split(' ')(x))
})
Test('trim', () => {
	const x = '	  1234 '
	assert.equal(x.trim(), trim(x))
})
Test('startsWith', () => {
	const x = 'abcd'
	assert.equal(x.startsWith('ab'), startsWith('ab')(x))
})
Test('endsWith', () => {
	const x = 'abcd'
	assert.equal(x.endsWith('cd'), endsWith('cd')(x))
})
Test('startsWithAny', () => {
	const x = 'America'
	assert.equal(true, startsWithAny(['yo', 'lo', 'Amer'])(x))
})
Test('endsWithAny', () => {
	const x = 'America'
	assert.equal(true, endsWithAny(['yo', 'lo', 'ica'])(x))
})

Test('getMany', () => {
	assert.deepEqual([1, 2, 3], getMany('x', 'y', 'z')({ x: 1, y: 2, z: 3 }))
})
Test('has_one', () => {
	assert.equal(true, has_one('345')('123'))
	assert.equal(false, has_one('345')('12'))
})
Test('print', () => {
	assert.equal('test', print('test'))
})