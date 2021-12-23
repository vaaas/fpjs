# fpjs

Functional programming utilities for Javascript.

Most functions are defined as curried functions. A function may receive a number of arguments, and the amount of arguments it receives is called its arity. Currying reduces every function to a unary function, i.e. a function that only takes one argument.

This is achieved by returning a function. For example, add:

	function add(a, b) {
		return a + b
	}

can be expressed as:

	function add(a) {
		return function(b) {
			return a + b
		}
	}

Or with the shorthand:

	const add = a => b => a + b

It can be called this way:

	add(a)(b)

This allows us:

- To partially apply functions. E.g. increment can be defined as `const inc = add(1)`
- A more consistent way to compose functions, since every function is a unary function

**Currying imposes a performance penalty** since new function scopes have to be allocated. This usually doesn't matter in the front-end, however.

# Testing framework

Set up the environment we need for testing.

```javascript test.mjs
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
```

# Combinators

Combinators are functions whose only operations are their own arguments, i.e. they do nothing but combine their arguments in various ways, hence the name. They automate function composition. Not to be confused with combinatorics.

There are infinite combinators, so these are the most useful ones. They are useful primarily during pipelines (see the definition of pipe and arrow below).

<https://en.wikipedia.org/wiki/Combinatory_logic>

<https://www.angelfire.com/tx4/cus/combinator/birds.html>

---

**B series**

Call a function with N arguments. Then, finally, pass it through a last, filter function.

```javascript index.mjs
export const B = a => b => c => a(b(c)) // bluebird - 1 argument
export const B1 = a => b => c => d => a(b(c)(d)) // blackbird - 2 arguments
export const B1u = (a, b) => (c, d) => a(b(c, d)) // blackbird uncurried
```

---

**C series**

Call a function with 2 arguments, but apply the arguments in reverse.

```javascript index.mjs
export const C = a => b => c => a(c)(b) // cardinal
export const Cu = a => (b, c) => a(c, b) // cardinal uncurried
```

---

**D series**

Call a function with N arguments, but apply each argument through a diffrent filter function before passing them.

```javascript index.mjs
export const D = a => b => c => d => e => a(b(d))(c(e)) // dovekies
export const Du = (a, b, c) => (d, e) => a(b(d), c(e)) // dovekies uncurried
```

---

**K series**

Always return the first argument. In other words, just return an argument.

```javascript index.mjs
export const K = a => () => a // kestrel
export const K1 = a => b => () => a(b) // kestrel once removed
export const just = K
```

---

**I series**

Identity function. Returns its argument.

```javascript index.mjs
export const I = x => x
export const id = I
```

---

**V - Vireo**

Call a function by providing two arguments first, and then the function. This can be an implementation of the cons pair, the fundamental data structure of Lisp, which is similar to a linked list.

<https://en.wikipedia.org/wiki/Cons>

```javascript index.mjs
export const V = a => b => f => f(a)(b) // vireo
export const Vu = (a, b) => f => f(a, b) // vireo uncurried
```

---

**Spread**

Call a function by spreading the argument. This can be used to treat a function with greater arity than 1, or with variadic arity, as a unary function.

```javascript index.mjs
export const spread = f => x => f(...x)
```

---

**Unspread**

Call a function by passing spreaded arguments as an array.

```javascript index.mjs
export const unspread = f => (...x) => f(x)
```

---

**N**

Provides access to the "new" Javascript keyword as a function.

```javascript index.mjs
export const N = o => x => new o(x)
```

---

**S - Starling prime**

Pass the same argument to a function twice, but first pass it through two separate filters.

```javascript index.mjs
export const S = a => b => c => d => a(b(d))(c(d)) // starling prime
export const Su = (a, b, c) => d => a(b(d), c(d)) // starling prime uncurried
```

---

**T - Thrush**

Call a function by providing the argument first, and then the function. You can also think of this as wrapping a value into a function, and calling it again unwraps it.

```javascript index.mjs
export const T = x => f => f(x) // thrush
```

---

**W - Warbler**

Apply an argument to a function twice.

```javascript index.mjs
export const W = a => b => a(b)(b) // Warbler
export const WS = a => b => a(...b)(...b)
export const Wu = a => b => a(b, b) // Warbler uncurried
```

---

**Q - Queer bird**

Pass an argument `c` through function `b`, but first pass it through `a` which changes it. Can be thought of as the let binding in lisp:

	(defun test (x)
		(let ((x (+ 1 1)))
			(message x))

vs

	const test = Q(x => x + 1)(console.log)

This essentially helps us "remember" a variable within a pipeline.

```javascript index.mjs
export const Q = a => b => c => b(a(c)) // queer bird
```

---

**tap**


Tap allows us to perform a side-effect, represented by f, passing x to it. Then the argument is returned. The most obvious use is to update an object, or to print an argument in a pipeline.

```javascript index.mjs
export const tap = f => x => { f(x) ; return x }
```

**Test**

```javascript test.mjs
Test('tap', () => {
	assert.deepEqual({ x: 1, y: 2 }, tap(x => x.y = 2)({ x: 1 }))
})
```

---

This is a runtime implementation of pipeline. All of the following are equivalent:

	x |> f |> g |> h
	pipe(x, f, g, h)
	h(g(f(x)))

```javascript index.mjs
export const pipe = (x, ...fs) => { for (let i = 0; i < fs.length; i++) x = fs[i](x); return x }
```

**Test**

```javascript test.mjs
Test('pipe', () => {
	assert.equal(10, pipe(1, x => x*10, x => ''+x, parseFloat))
})
```

---

**arrow**

This is a runtime implementation of pipelined function composition, or reverse function composition. All of the following are equivalent:

	fun = f >> g >> h
	fun = arrow(f, g, h)
	fun = x => h(g(f(x)))

```javascript index.mjs
export const arrow = (...fs) => x => { for (let i = 0; i < fs.length; i++) x = fs[i](x); return x }
```

**Test**

```javascript test.mjs
Test('arrow', () => {
	assert.equal(10, arrow(x => x*10, x => ''+x, parseFloat)(1))
})
```

---

**Curry**

Turns a function with two arguments into a curried function.

```javascript index.mjs
export const curry = f => a => b => f(a, b)
```

**Test**

```javascript test.mjs
Test('curry', () => {
	const add = (a,b) => a+b
	assert.equal(add(1, 2), curry(add)(1)(2))
})
```

---

**by**

Enables us to to sort an array *by* a function. For example:

	[{ x: 3 }, { x: 1 }].sort(by(x => x.x))

returns `[{ x: 1}, { x: 3}]`

```javascript index.mjs
export const by = f => (a,b) => f(a) < f(b) ? -1 : 1
```

---

**do_nothing**

Simply returns false.

```javascript index.mjs
export const do_nothing = K(false)
```

**Test**

```javascript test.mjs
Test('do_nothing', () => {
	assert.equal(false, do_nothing())
})
```

---

**waterfall**

Helps us flatten a "callback hell" tree without using promises. For example:

	function A(a, b, function(err, x) {
		if (!err) B(x, function(err, x) {
			if (!err) console.log(x)
		}
	}

will become:

	waterfall(
		(f) => A(a, b, f),
		(f, err, x) => { if (err) throw err; else B(x) },
		(f, err, x) => { if (err) throw err; else console.log(x) },)

```javascript index.mjs
export function waterfall(...fs) {
	let i = 0
	const f = (...xs) => (fs[++i] || do_nothing)(f, ...xs)
	fs[0](f)
}
```

**Test**

```javascript test.mjs
Test('waterfall', () => {
	const add = (a, b, f) => f(a+b)
	waterfall(
		f => add(1, 2, f),
		(f, x) => add(x, 2, f),
		(f, x) => add(x, 5, f),
		(f, x) => assert.equal(10, x)
	)
})
```

---

**bind**

Curried implementation of `Function.prototype.bind`

<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind>

```javascript index.mjs
export const bind = f => x => f.bind(x)
```

**Test**

```javascript test.mjs
Test('bind', () => {
	const arr = [1,2,3]
	const inc = x => x + 1
	assert.deepEqual(arr.map(inc), bind(arr.map)(arr)(inc))
})
```

# Objects

Various functions relating to objects (remember that arrays are also objects).

---

**get**

Get element `k` of object `x`. What is considered "getting" varies by the type of object:

- For objects, `k` is a property
- For arrays, `k` is an index
- For maps, `k` if a key that is fetched with `Map.prototype.get`
- For null and undefined, return null

You can also provide multiple keys `ks`, in which case execution will be pipelined, fetching increasingly nested objects with each iteration. For example:

	x = [{ value: 1 }, { value: 2 }]
	get(0, 'value')(x)

returns `1`

```javascript index.mjs
export const get = (...ks) => x => {
	if (ks.length === 1) return get_(ks[0], x)
	else return ks.reduce(Cu(get_), x)
}

function get_(k, x) {
	if (x === null || x === undefined) return null
	switch (x.constructor) {
		case Map: return x.get(k)
		default: return x[k]
	}
}
```

**Test**

```javascript test.mjs
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
```

---

**set**

Set key `k` to the value `v` for object `o`. Like `get`, execution varies depending on the type of object `o`:

- Nothing happens for null or undefined
- For objects, set the property `k` to the value `v`
- For arrays, set the index `k` to the value `v`
- For Maps, use `Map.prototype.set` to set the key `k` to the value `v`

```javascript index.mjs
export const set = k => v => tap(o => {
	if (o === null || o === undefined) return
	else if (o.constructor === Map) o.set(k, v)
	else o[k] = v
})
```

**Test**

```javascript test.mjs
Test('set', () => {
	assert.deepEqual({ x: 1, y: 2 }, set('y')(2)({ x: 1 }))
	assert.deepEqual([0, 1], set(1)(1)([0]))
})
```

---

**get_from**

Like `get` but with inverted arguments. Gets key `k` from object `x` depending on the type of the object. Unlike `get`, does not receive multiple keys `ks`.

```javascript index.mjs
export const get_from = C(get)
```

**Test**

```javascript test.mjs
Test('get_from', () => {
	const x = [
		{ val: new Map([[ 'yo', 'lo' ]]) },
		1,
		2
	]

	assert.equal(x[0], get_from(x)(0))
})
```

---

**pluck**

Like `get`, but only fetches a single property `k` from object `x`.

```javascript index.mjs
export const pluck = k => x => (x === null || x === undefined) ? null : x[k]
```

**Test**

```javascript test.mjs
Test('pluck', () => {
	const x = [1,2,3]
	assert.equal(x[0], pluck(0)(x))
	assert.equal(x[1], pluck(1)(x))
	assert.equal(x[2], pluck(2)(x))
})
```

---

**change**

Change the values on an object `x` in place by passing them through a function `f`. Application can be limitted to the properties `keys`; if none are provided, all properties are included. The modified object `x` is returned.

For example:

	({ value: '1', name: 'Bob' }) |> change(parseFloat, 'value')

```javascript index.mjs
export const change = (f, ...keys) => tap(x => {
	if (keys.length === 0) keys = Object.keys(x)
	keys.forEach(k => x[k] = f(x[k]))
})
```

**Test**

```javascript test.mjs
Test('change', () => {
	assert.deepEqual({ a: 1, b: 2, c: 'test'}, change(parseFloat, 'a', 'b')({ a: '1', b: '2', c: 'test'}))
})
```

---

**Update**

Update an object b *in place* by copying properties and values from object `a`. By default, every property of `a` is included, but you can limit it to only the properties `keys`.

```javascript index.mjs
export const update = (a, ...keys) => b => {
	if (keys.length === 0) keys = Object.keys(a)
	for (const k of keys) b[k] = a[k]
	return b
}
```

**Test**

```javascript test.mjs
Test('update', () => {
	assert.deepEqual({ a: 1, b: 2, c: 'test'}, update({ c: 'test' })({ a: 1, b: 2 }))
})
```

---

**object_map**

`map` implementation for objects. Passes keys and values as duads of object `xs` through the function `f`, with signature:

	f: Duad(String key, Any value) -> Duad(String key, Any value)

Then a new object is created based on the array of duads. For example:

	object_map(([k, v]) => [k + '_better', v + 1])({ a: 1, b: 2 })

returns `{ a_better: 2, b_better: 3 }`

```javascript index.mjs
export const object_map = f => xs => Object.fromEntries(Object.entries(xs).map(x => f(x, xs)))
```

**Test**

```javascript test.mjs
Test('object_map', () => {
	assert.deepEqual({ a_test: 2, b_test: 3 }, object_map(([k, v]) => [k + '_test', v+1])({ a: 1, b: 2}))
})
```

---

**object_filter**

`filter` implementation for objects. Passes keys and values as duads of object `xs` through the function `f`, with signature:

	f: Duad(String key, Any value) -> Boolean

A new object is created, including the only they duads for which f returned true. For example:

	object_filter(([k, v]) => k !== 'a')({ a: 1, b: 2 })

returns `{ b: 2 }`

```javascript index.mjs
export const object_filter = f => xs => Object.fromEntries(Object.entries(xs).filter(x => f(x, xs)))
```

**Test**

```javascript test.mjs
Test('object_filter', () => {
	assert.deepEqual({ a: 1 }, object_filter(([k, v]) => k !== 'b' && v < 2)({ a: 1, b: 1, c: 15 }))
})
```

# Booleans

**not**

Reverses true into false and false into true

```javascript index.mjs
export const not = a => !a
```

**Test**

```javascript test.mjs
Test('not', () => {
	assert.equal(!true, not(true))
	assert.equal(!false, not(false))
})
```

---


**and**

Curried implementation of `&&`.

```javascript index.mjs
export const and = a => b => b && a
```

**Test**

```javascript test.mjs
Test('and', () => {
	assert.equal(true && true, and(true)(true))
	assert.equal(true && false, and(true)(false))
	assert.equal(false && false, and(false)(false))
	assert.equal(false && true, and(false)(true))
})
```

---

**or**

Curried implementation of `||`

```javascript index.mjs
export const or = a => b => b || a
```

**Test**

```javascript test.mjs
Test('or', () => {
	assert.equal(true || true, or(true)(true))
	assert.equal(true || false, or(true)(false))
	assert.equal(false || false, or(false)(false))
	assert.equal(false || true, or(false)(true))
})
```

---

# Combinatorics

**combinations**

A generator function that yields all the possible combinations of the provided arrays.

For example, passing the following arguments to it:

	combinations([1, 2], ['red', 'blue'])

would yield:

	[1, 'red']
	[1, 'blue']
	[2, 'red']
	[2, 'blue']

```javascript index.mjs
export function* combinations(...xs) { yield* _combine([], xs) }
function* _combine(head=[], tails=[[]]) {
	if (tails.length === 0) yield head
	else for (const x of first(tails)) yield* _combine([...head, x], tail(tails))
}
```

**Test**

```javascript test.mjs
Test('combinations', () => {
	assert.deepEqual(
		[[1, 'red'], [1, 'blue'], [2, 'red'], [2, 'blue']],
		Array.from(combinations([1,2], ['red', 'blue']))
	)
})
```

---

**combinations_fn**

Works exactly like `combinations`, except it accepts generator functions instead of arrays. This is useful because the current working head is passed into the function, and it can return different results depending on its contents. As thus we can exclude some combinations.

```javascript index.mjs
export function* combinations_fn(...fs) { yield* _combine_fn([], fs) }
function* _combine_fn(head=[], fs=[]) {
	if (fs.length === 0) yield head
	else for (const x of first(fs)(head)) yield* _combine_fn([...head, x], tail(fs))
}
```

**Test**

```javascript test.mjs
Test('combinations_fn', () => {
	assert.deepEqual(
		[[1, 'red'], [1, 'blue'], [2, 'red'], [2, 'blue']],
		Array.from(combinations_fn(K([1,2]), K(['red', 'blue'])))
	)
})
```

# Arrays

**first**

Gets the first array element.

```javascript index.mjs
export const first = x => x[0]
```

**Test**

```javascript test.mjs
Test('first', () => {
	const arr = [1,2,3]
	assert.equal(arr[0], first(arr))
})
```

---

**second**

Gets the second array element.

```javascript index.mjs
export const second = x => x[1]
```

**Test**

```javascript test.mjs
Test('second', () => {
	const arr = [1,2,3]
	assert.equal(arr[1], second(arr))
})
```

---

**last**

Gets the last array element.

```javascript index.mjs
export const last = x => x[x.length-1]
```

**Test**

```javascript test.mjs
Test('last', () => {
	const arr = [1,2,3]
	assert.equal(arr[2], last(arr))
})
```

---

**head**

Gets all the array elements but the last.

```javascript index.mjs
export const head = x => x.slice(0, x.length - 1)
```

**Test**

```javascript test.mjs
Test('head', () => {
	const arr = [1,2,3]
	assert.deepEqual([1,2], head(arr))
})
```

---

**tail**

Gets all the array elements but the first.

```javascript index.mjs
export const tail = x => x.slice(1)
```

**Test**

```javascript test.mjs
Test('tail', () => {
	const arr = [1,2,3]
	assert.deepEqual([2,3], tail(arr))
})
```

---

**slice**

Curried implementation of `Array.prototype.slice`.

export const slice = (a, b=Infinity) => xs => xs.slice(a, b)

<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Array/slice>

```javascript index.mjs
export const slice = (a, b=Infinity) => xs => xs.slice(a, b)
```

**Test**

```javascript test.mjs
Test('slice', () => {
	const arr = [1,2,3]
	assert.deepEqual([1,2,3], slice(0, 3)(arr))
	assert.deepEqual([1,2], slice(0, 2)(arr))
	assert.deepEqual([1], slice(0, 1)(arr))
	assert.deepEqual([], slice(0, 0)(arr))
	assert.deepEqual([2,3], slice(1)(arr))
})
```

---

**array_map**

Curried implementation of `Array.prototype.map`

<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map>

```javascript index.mjs
export const array_map = f => x => x.map(f)
```

**Test**

```javascript test.mjs
Test('array_map', () => {
	const arr = [1,2,3]
	const inc = x => x+1
	assert.deepEqual(arr.map(inc), array_map(inc)(arr))
})
```

---

**array_filter**

Curried implementation of `Array.prototype.filter`

<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter>

```javascript index.mjs
export const array_filter = f => x => x.filter(f)
```

**Test**

```javascript test.mjs
Test('array_filter', () => {
	const arr = [1,2,3]
	const even = x => x % 2 === 0
	assert.deepEqual(arr.filter(even), array_filter(even)(arr))
})
```

---

**array_splice**

Curried implementation of `Array.prototype.splice`

<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice>

```javascript index.mjs
export const array_splice = (a, b) => x => x.splice(a, b)
```

**Test**

```javascript test.mjs
Test('array_splice', () => {
	assert.deepEqual([2,3], array_splice(1,2)([1,2,3]))
})
```

---

**array_take**

Removes the element of index `i` from the array `x` *in place*. Returns `x` modified.

```javascript index.mjs
export const array_take = i => tap(x => x.splice(i, 1))
```

**Test**

```javascript test.mjs
Test('array_take', () => {
	assert.deepEqual([1,2,3], array_take(2)([1,2,'memes',3]))
})
```

---

**array_get**

Convenience function that calls `get` on every item of array `x`. Functionally identical to `array_map(get)`

```javascript index.mjs
export const array_get = B(array_map)(get)
```

**Test**

```javascript test.mjs
Test('array_get', () => {
	assert.deepEqual([1,2,3], array_get('x')([{ x: 1 }, { x: 2 }, { x: 3} ]))
})
```

---

**array_push**

Curried implementation of `Array.prototype.push`. Returns the array.

<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push>

```javascript index.mjs
export const array_push = x => tap(xs => xs.push(x))
```

**Test**

```javascript test.mjs
Test('array_push', () => {
	assert.deepEqual([1,2,3], array_push(3)([1,2]))
})
```

---

**pick**

Returns a random element of an array `xs`.

```javascript index.mjs
export const pick = x => x[randint(0, x.length)]
```

**Test**

```javascript test.mjs
Test('pick', () => {
	assert.deepEqual(typeof 1, typeof pick([1,2,3]))
})
```

---

**construct**

Creates an array of length `n`. Each value will be provided by the function `f`.

```javascript index.mjs
export function construct(f, n) {
	const x = []
	for (let i = 0; i < n; i++) x.push(f(i, n, x))
	return x
}
```

**Test**

```javascript test.mjs
Test('construct', () => {
	assert.deepEqual(['Number 1', 'Number 2', 'Number 3'], construct(i => 'Number ' + (i+1), 3))
})
```

---

**join**

Combine elements of a sequence `xs` into a string, separated by delimiter `d`. Similar to `Array.prototype.join` but works for any sequence.

```javascript index.mjs
export const join = d => xs => {
	if (xs === null || xs === undefined) return ''
	else if (xs.constructor === Array) return xs.join(d)
	else if (isIterable(xs)) return Array.from(xs).join(d)
	else return ''
}
```

**Test**

```javascript test.mjs
Test('join', () => {
	assert.equal('1 2 3', join(' ')([1,2,3]))
	assert.equal('1 2 3', join(' ')('123'))
	assert.equal('1 2 3', join(' ')(new Set([1, 2, 3])))
	assert.equal('1 2 3', join(' ')(new Map([[1, 'yo'], [2, 'lo'], [3, 'swag']]).keys()))
})
```

---

**sort**

Sorts a sequence `x` using the same implementation as `Array.prototype.sort`.

```javascript index.mjs
export const sort = f => x => x.constructor === Array ? x.sort(f) : Array.from(x).sort(f)
```

**Test**

```javascript test.mjs
Test('sort', () => {
	const lexical = (a,b) => a < b ? -1 : 1
	assert.deepEqual(['1','2','3'], sort(lexical)('321'))
	assert.deepEqual([1,2,3], sort(lexical)([3,2,1]))
	assert.deepEqual([1,2,3], sort(lexical)(new Set([3,2,1])))
	assert.deepEqual([1,2,3], sort(lexical)((function*() { yield 3; yield 2; yield 1; })()))
})
```

---

**reverse**

Reverses a sequence. Returns a new sequence, backwards.

```javascript index.mjs
export const reverse = x => Array.from(x).reverse()
```

**Test**

```javascript test.mjs
Test('reverse', () => {
	const arr = [1,2,3]
	assert.deepEqual([3,2,1], reverse(arr))
	assert.deepEqual(['3','2','1'], reverse('123'))
	assert.deepEqual([3,2,1], reverse(new Set(arr)))
})
```

---

**objectify**

Turns an array `xs` into an object. Each item `x` will be the value. The key will be determined by the function `f` with argument `x`.

Example:

	[{ name: 'Bob', money: 10 }, { name: 'Rob', money: 0 }] |> objectify(pluck('name'))

returns `{ Bob: { name: 'Bob', money: 10 }, Rob: { name: 'Rob', money: 0 } }`

```javascript index.mjs
export const objectify = f => foldr(x => tap(o => o[f(x)] = x))({})
```

**Test**

```javascript test.mjs
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
```

---

**swap**

Swaps the item of array `xs` at index `a` with the item at index `b` *in place*. Returns the modified array.

```javascript index.mjs
export function swap (xs, a, b) {
	const c = xs[a]
	xs[a] = xs[b]
	xs[b] = c
	return xs
}
```

**Test**

```javascript test.mjs
Test('swap', () => {
	assert.deepEqual([2,1], swap([1,2], 0, 1))
})
```

---

**group**

Group an array `xs`. The logic to group by is provided by `f` with argument `x` being the current element of `xs`.

For example:

	[ 5, 10, 12, 99 ] |> group(x => x % 5 === 0)
	// { true: [ 5, 10 ], false: [ 12, 99 ] }

You can provide multiple functions `fs` which will group `xs` on several levels, increasingly nested.

```javascript index.mjs
export const group = (...fs) => xs => {
	if (fs.length === 0) return xs
	else {
		const groups = group_(first(fs), xs)
		for (const k of Object.keys(groups))
			groups[k] = group(...tail(fs))(groups[k])
		return groups
	}
}

const group_ = (f, xs) =>
	foldr(x => tap(groups => {
		const g = f(x)
		if (!groups.hasOwnProperty(g)) groups[g] = []
		groups[g].push(x)
	}))({})(xs)
```

**Test**

```javascript test.mjs
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
```

---

**partition**

Split a sequence into N sequences. Each sequence corresponds to a single filter F.

```javascript index.mjs
export const partition = (...fs) => foldr(x => tap(xs => {
	const i = fs.findIndex(T(x))
	if (i !== -1) xs[i].push(x)
}))(construct(() => [], fs.length))
```

```javascript test.mjs
Test('partition', () => {
	assert.deepEqual(
		[[1], [2,4], [5]],
		partition
			(is(1), divisible(2), divisible(5))
			([1,2,3,4,5]))
})
```

---

# Equality

**is**

Tests whether `a` is identical to `b` (same pointer).

```javascript index.mjs
export const is = a => b => a === b
```

**Test**

```javascript test.mjs
Test('is', () => {
	assert.equal(1 === 1, is(1)(1))
	assert.equal({} === {}, is({})({}))
})
```

---

**like**

Tests whether `a` is equal to `b`, coercing types if necessary.

```javascript index.mjs
export const like = a => b => a == b
```

```javascript test.mjs
Test('like', () => {
	assert.equal(1 == 1, like(1)(1))
	assert.equal(1 == '1', like(1)('1'))
	assert.equal({} == {}, like({})({}))
})
```

---

**isnt**

The opposite of `is`.

```javascript index.mjs
export const isnt = B1(not)(is)
```

**Test**

```javascript test.mjs
Test('isnt', () => {
	assert.equal(1 !== 1, isnt(1)(1))
	assert.equal({} !== {}, isnt({})({}))
})
```

---

**null_undefined**

Tests whether a value is null or undefined.

```javascript index.mjs
export const null_undefined = x => x === null || x === undefined
```

**Test**

```javascript test.mjs
Test('null_undefined', () => {
	assert.equal(true, null_undefined(null))
	assert.equal(true, null_undefined(undefined))
	assert.equal(false, null_undefined(false))
	assert.equal(false, null_undefined(NaN))
	assert.equal(false, null_undefined({}))
})
```

---

**defined**

`true` for every value that isn't null or undefined.

```javascript index.mjs
export const defined = B(not)(null_undefined)
```

**Test**

```javascript test.mjs
Test('defined', () => {
	assert.equal(false, defined(null))
	assert.equal(false, defined(undefined))
	assert.equal(true, defined(false))
	assert.equal(true, defined(NaN))
	assert.equal(true, defined({}))
})
```

---

**AND**

Passes the argument x through the functions fs, and tests whether they all return true.

```javascript index.mjs
export const AND = fs => x => fs.every(T(x))
```

**Test**

```javascript test.mjs
Test('AND', () => {
	assert.equal(true, AND([K(1), K(2), K(true)])())
	assert.equal(false, AND([K(false)])())
	assert.equal(true, AND([])())
})
```

---

**OR**

Passes the argument x through the functions fs, and tests whether at least one returns true.

```javascript index.mjs
export const OR = fs => x => fs.some(T(x))
```

**Test**

```javascript test.mjs
Test('OR', () => {
	assert.equal(true, OR([K(1), K(2), K(false)])())
	assert.equal(false, OR([K(false)])())
	assert.equal(false, OR([])())
})
```

---

**instance**

Curried implementation of instanceof

```javascript index.mjs
export const instance = a => b => b instanceof a
```

**Test**

```javascript test.mjs
Test('instance', () => {
	assert.equal(1 instanceof Number, instance(Number)(1))
	assert.equal(1 instanceof String, instance(String)(1))
})
```

---

**equal**

Test whether a and b are equal. If they are objects, test if their keys and values are equal. Likewise, if they are sets or maps, test if their keys and members are equal. (deep equality)

```javascript index.mjs
export function equal (a, b) {
	if (a === b) return true
	else if (!(a && b)) return false
	else if (a.constructor === b.constructor) {
		switch (a.constructor) {
			case Map:
				if (a.size !== b.size) return false
				for (const [k, v] of a)
					if (!b.has(k) || b.get(k) !== v)
						return false
				return true
			case Set:
				if (a.size !== b.size) return false
				for (const x of a)
					if (!b.has(x))
						return false
				return true
			default:
				if (typeof a === 'object') {
					const as = Object.keys(a)
					if (as.length !== Object.keys(b).length)
						return false
					for (let i = 0; i < as.length; i++)
						if (!equal(a[as[i]], b[as[i]]))
							return false
					return true
				} else return false
		}
	} else return false
}
```

**Test**

```javascript test.mjs
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
```

# Flow Control

run `good(x)` if `cond(x)` is true. Otherwise, run `bad(x)`.

**ifelse**

```javascript index.mjs
export const ifelse = cond => (good, bad) => x => cond(x) ? good(x) : bad(x)
```

**Test**

```javascript test.mjs
Test('ifelse', () => {
	assert.equal(1, ifelse(Boolean)(K(1), K(2))(true))
	assert.equal(2, ifelse(Boolean)(K(1), K(2))(false))
})
```

---

**when**

Run `then(x)` if `cond(x)` is true. Otherwise, return `x`.

```javascript index.mjs
export const when = cond => then => x => cond(x) ? then(x) : x
```

**Test**

```javascript test.mjs
Test('when', () => {
	assert.equal('test', when(Boolean)(K('test'))(true))
	assert.equal(false, when(Boolean)(K('test'))(false))
})
```

---

**maybeor**

Accepts two functions as arguments:

	maybeor(good, bad)(x)

When x is null or undefined, return bad(x). Otherwise, return good(x). This a function implementation of the Maybe monad.

```javascript index.mjs
export const maybeor = ifelse(defined)
```

**Test**

```javascript test.mjs
Test('maybeor', () => {
	assert.equal('test', maybeor(K('test'), K('best'))(true))
	assert.equal('best', maybeor(K('test'), K('best'))(null))
})
```

---

**maybe**

More specialised version of maybeor. Run a function only when an argument is *not* null or undefined.

```javascript index.mjs
export const maybe = when(defined)
```

**Test**

```javascript test.mjs
Test('maybe', () => {
	assert.equal(2, maybe(x => x + 1)(1))
	assert.equal(null, maybe(x => x + 1)(null))
})
```

---

**nothing**

More specialised version of maybeor. Run a function only when an argument *is* null or undefined.

```javascript index.mjs
export const nothing = when(null_undefined)
```

**Test**

```javascript test.mjs
Test('nothing', () => {
	assert.equal(2, nothing(K(2))(null))
	assert.equal(1, nothing(K(2))(1))
})
```

---

**success**

Like maybe, but only runs for non-error variables.

```javascript index.mjs
export const success = when(x => !(x instanceof Error))
```

**Test**

```javascript test.mjs
Test('success', () => {
	assert.equal(2, success(x => x + 1)(1))
	assert.equal(true, success(x => x + 1)(new Error('swag')) instanceof Error)
})
```

---

Like nothing, but only runs for error variables.

**failure**

```javascript index.mjs
export const failure = when(instance(Error))
```

**Test**

```javascript test.mjs
Test('failure', () => {
	assert.equal(1, failure(x => x + 1)(1))
	assert.equal('swag', failure(x => x.message)(new Error('swag')))
})
```

---

**trycatch**

Like `maybeor`, but instead switches based on whether the value is an error or not.

```javascript index.mjs
export const trycatch = ifelse(x => !(x instanceof Error))
```

**Test**

```javascript test.mjs
Test('trycatch', () => {
	const test = trycatch(x => x+1, x => x.message)
	assert.equal(2, test(1))
	assert.equal('hmm', test(new Error('hmm')))
})
```

---

**valmap**

Switch-like implementation as a function. Given the array xs in the format

	[
		value1, mapped1,
		value2, mapped2,
		...
	]

Change value x such that: if x is equal to value1, change to mapped1. If x is equal to value2, change to mapped2.

If no mapping is found:

- If the length of xs is even, return x (unchanged)
- If the length of xs is odd, return the last value of xs (default value)

```javascript index.mjs
export const valmap = (...xs) => x => {
	const len = xs.length - xs.length % 2
	for (let i = 0; i < len; i += 2)
		if (xs[i] === x) return xs[i+1]
	return len === xs.length ? x : last(xs)
}
```

**Test**

```javascript test.mjs
Test('valmap', () => {
	const test = valmap(1, 'a', 2, 'b', 'no idea')
	assert.equal('a', test(1))
	assert.equal('b', test(2))
	assert.equal('no idea', test(Infinity))
})
```

---

**cond**

More generic version of valmap. Instead of providing, values, instead provide functions. A mapped function will only run with argument `x` if its preceding condition function returns true when applied with argument `x`.

```javascript index.mjs
export const cond = (...fs) => x => {
	const len = fs.length - fs.length % 2
	for (let i = 0; i < len; i += 2)
		if (fs[i](x)) return fs[i+1](x)
	return len === fs.length ? x : last(fs)(x)
}
```

**Test**

```javascript test.mjs
Test('cond', () => {
	const test = cond(is(1), K('a'), is(2), K('b'), K('no idea'))
	assert.equal('a', test(1))
	assert.equal('b', test(2))
	assert.equal('no idea', test(Infinity))
})
```

---

**attempt**

Run a function and return its result. If there is an error during its execution, capture the error and return it, without throwing.

```javascript index.mjs
export const attempt = f => {
	try { return f() }
	catch (e) { return e }
}
```

**Test**

```javascript test.mjs
Test('attempt', () => {
	assert.equal('test',
		attempt(function() { throw new Error('test') }).message
	)
})
```

---

**reject**

throw an error when a value `x` is an invalid state

```javascript index.mjs
export const reject = (f, m) => x => {
	if (f(x)) throw m(x)
	else return x
}
```

**Test**

```javascript test.mjs
Test('reject', () => {
	try {
		reject(is('Test'), K('Test'))('Test')
	} catch(e) {
		assert.equal('Test', e)
	}

	assert.equal('Best', reject(is('Test'), K('Test'))('Best'))
})
```

# Mathematics

**between**

Test whether the value `x` is between `low` and `high`, both ends inclusive.

```javascript index.mjs
export function between (x, low, high) { return x >= low && x <= high }
```

**Test**

```javascript test.mjs
Test('between', () => {
	assert.equal(true, between(1, 0, 10))
	assert.equal(true, between(1, 1, 10))
	assert.equal(true, between(10, 1, 10))
	assert.equal(false, between(0.5, 1, 10))
	assert.equal(false, between(10.0001, 1, 10))
})
```

---

**cbetween**

Curried syntax for `between`

```javascript index.mjs
export const cbetween = (low, high) => x => between(x, low, high)
```

**Test**

```javascript test.mjs
Test('cbetween', () => {
	assert.equal(true, cbetween(0, 10)(1))
	assert.equal(true, cbetween(1, 10)(1))
	assert.equal(true, cbetween(1, 10)(10))
	assert.equal(false, cbetween(1, 10)(0.5))
	assert.equal(false, cbetween(1, 10)(10.0001))
})
```

---

**gt**

Curried implementation of `>`.

```javascript index.mjs
export const gt = a => b => b > a
```

**Test**

```javascript test.mjs
Test('gt', () => {
	assert.equal(1 > 2, gt(2)(1))
	assert.equal(2 > 1, gt(1)(2))
	assert.equal(2 > 2, gt(2)(2))
})
```

---

**gte**

Curried implementation of `>=`.

```javascript index.mjs
export const gte = a => b => b >= a
```

**Test**

```javascript test.mjs
Test('gte', () => {
	assert.equal(1 >= 2, gte(2)(1))
	assert.equal(2 >= 1, gte(1)(2))
	assert.equal(2 >= 2, gte(2)(2))
})
```

---

**lt**

Curried implementation of `<`.

```javascript index.mjs
export const lt = a => b => b < a
```

**Test**

```javascript test.mjs
Test('lt', () => {
	assert.equal(1 < 2, lt(2)(1))
	assert.equal(2 < 1, lt(1)(2))
	assert.equal(2 < 2, lt(2)(2))
})
```

---

**lte**

Curried implementation of `lte`.

```javascript index.mjs
export const lte = a => b => b <= a
```

**Test**

```javascript test.mjs
Test('lte', () => {
	assert.equal(1 <= 2, lte(2)(1))
	assert.equal(2 <= 1, lte(1)(2))
	assert.equal(2 <= 2, lte(2)(2))
})
```

---

**pow**

Curried implementation of `Math.pow`

```javascript index.mjs
export const pow = a => b => b**a
```

**Test**

```javascript test.mjs
Test('pow', () => {
	assert.equal(2**3, pow(3)(2))
	assert.equal(2**0, pow(0)(2))
})
```

---

**mult**

Curried implementation of multiplication.

```javascript index.mjs
export const mult = a => b => a*b
```

**Test**

```javascript test.mjs
Test('mult', () => {
	assert.equal(2*2, mult(2)(2))
})
```

---

**div**

Curried multiplication of division.

```javascript index.mjs
export const div = a => b => b/a
```

**Test**

```javascript test.mjs
Test('div', () => {
	assert.equal(3/2, div(2)(3))
})
```

---

**divisible**

Returns true if a number B is divisible by A (it has zero remainder).

```javascript index.mjs
export const divisible = a => b => b % a === 0
```

**Test**

```javascript test.mjs
Test('divisible', () => {
	assert.equal(true, divisible(2)(4))
	assert.equal(true, divisible(3)(30))
	assert.equal(false, divisible(100)(101))
})
```

---

**add**

Curried implementation of addition and concatenation. Results depend on the type of the arguments:

- If one of the arguments is null or undefined, return null
- If the arguments have different types, return null
- If the arguments are numbers, add them
- If the arguments are strings, concatenate them
- If the arguments are arrays, concatenate them into a new array
- If the arguments are objects, merge them into a new object
- If the arguments are maps, merge them into a new map
- If the arguments are sets, unite them into a new set
- If the arguments are iterables, concatenate them
- Otherwise, return null

```javascript index.mjs
export const add = a => b => {
	if (a === null || a === undefined || b === null || b === undefined || a.constructor !== b.constructor)
		return null

	else switch(a.constructor) {
		case Number:
		case String: return a + b

		case Array: return [...a, ...b]

		case Map: {
			const n = new Map(Array.from(a.entries()))
			for (const [k, v] of b.entries()) n.set(k, v)
			return n
		}

		case Set: {
			const n = new Set(a)
			for (const x of b) n.add(x)
			return n
		}

		case Object:
			return { ...a, ...b }
			break

		default:
			if (isIterable(a) && isIterable(b))
				return (function* () { yield* a ; yield* b })()
			else
				return null
			break
	}
}
```

**Test**

```javascript test.mjs
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
```

---

**addr**

Like `add`, but takes its arguments in reverse. This doesn't have any implications for numbers, but for concatenation, it adds the first argument as a suffix instead of a prefix.

```javascript index.mjs
export const addr = C(add)
```

**Test**

```javascript test.mjs
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
```

---

**randint**

Return a random integer in the [a, b) range.

```javascript index.mjs
export const randint = (a, b) => a+Math.floor(Math.random()*(b-a))
```

**Test**

```javascript test.mjs
Test('randint', () => {
	assert.equal(true, randint(0, 15) < 16)
})
```

---

**clamp**

Clamps a number `x` between `min` and `max`. If it is lower than `min`, return `min`. If it is lower than `max`, return `max`. Otherwise return `x`.

```javascript index.mjs
export const clamp = (x, min, max) => {
	if (x < min) return min
	else if (x > max) return max
	else return x
}
```

**Test**

```javascript test.mjs
Test('clamp', () => {
	assert.equal(5, clamp(5, 1, 10))
	assert.equal(10, clamp(999, 1, 10))
	assert.equal(1, clamp(-Infinity, 1, 10))
})
```

---

**relative**

Returns the ratio of x compared to max, but they are both normalised to min. For example:

	relative(230, 0, 100)

Is 2.3. But:

	relative(230, 50, 100)

Is about 2.57. In other words, it's how far x is down the line segment from min to max. This is useful in the analytics calculations.

```javascript index.mjs
export const relative = (x, min, max) => (x-min)/(max-min)
```

---

**ceil**

Ceiling and floor functions with n digits of precision. 0 slices off all floating point numbers. Negatives increase floating-point precision, positives reduce integer precision.

```javascript index.mjs
export const ceil = (x, n=0) => Math.ceil(x*10**-n)*10**n
```

**Test**

```javascript test.mjs
Test('ceil', () => {
	assert.equal(1, ceil(0.88))
	assert.equal(0.9, ceil(0.88, -1))
	assert.equal(10, ceil(0.88, 1))
})
```

---

**floor**

Ceiling and floor functions with n digits of precision. 0 slices off all floating point numbers. Negatives increase floating-point precision, positives reduce integer precision.

```javascript index.mjs
export const floor = (x, n=0) => Math.floor(x*10**-n)*10**n
```

**Test**

```javascript test.mjs
Test('floor', () => {
	assert.equal(1, floor(1.88))
	assert.equal(1.8, floor(1.88, -1))
	assert.equal(0, floor(1.88, 1))
})
```

---

**minmax**

Simultanaously returns the min and the max of two numbers.

```javascript index.mjs
export const minmax = (a, b) => b < a ? [b, a] : [a, b]
```

**Test**

```javascript test.mjs
Test('minmax', () => {
	assert.deepEqual([1,2], minmax(2,1))
	assert.deepEqual([1,2], minmax(1,2))
})
```

---

**plus_mod**

Add the modulo of a number to the number. Essentially, increases x strictly by increments of m.

```javascript index.mjs
export const plus_mod = m => x => x + (m - x % m)
```

**Test**

```javascript test.mjs
Test('plus_mod', () => {
	assert.deepEqual(5, plus_mod(5)(4))
	assert.deepEqual(10, plus_mod(5)(5))
	assert.deepEqual(10, plus_mod(5)(6))
	assert.deepEqual(10, plus_mod(5)(7))
	assert.deepEqual(10, plus_mod(5)(8))
})
```

---

**rollover**

When x is under low, rolls it over to high. Likewise, when it is over high, rolls it over to low.

```javascript index.mjs
export const rollover = (low, high) => x => {
	if (x < low) return high
	else if (x > high) return low
	else return x
}
```

**Test**

```javascript test.mjs
Test('rollover', () => {
	assert.equal(3, rollover(0, 3)(-1))
	assert.equal(0, rollover(0, 3)(4))
})
```

---

**naturals**

Infinite generator yielding the natural numbers.

```javascript index.mjs
export function* naturals() { let i = 0 ; while (true) yield i++ }
```

**Test**

```javascript test.mjs
Test('naturals', () => {
	let i = 0
	for (const x of naturals()) {
		assert.equal(i, x)
		i++
		if (i > 10) break
	}
})
```

---

****

Represents an interval [min, max].

`constructor(Number min, Number max)`: initialises the range with min and max end points.

`includes(Number x) -> Boolean`: tests whether x belongs in the interval.

```javascript index.mjs
export class Range {
	constructor(min, max) {
		this.min = min
		this.max = max
	}

	includes(x) {
		return between(x, this.min, this.max)
	}
}
```

**Test**

```javascript test.mjs
Test('Range', () => {
	const rng = new Range(0, 10)
	assert.equal(true, rng.includes(0))
	assert.equal(true, rng.includes(10))
	assert.equal(true, rng.includes(5))
	assert.equal(false, rng.includes(11))
	assert.equal(false, rng.includes(-0.01))
})
```

---

**probability**

Turns a percentage into a probability.

```javascript index.mjs
export const probability = div(100)

```

**Test**

```javascript test.mjs
Test('probability', () => {
	assert.equal(0.01, probability(1))
})
```

---

**percentage**

Turns a probability into a percentage.

```javascript index.mjs
export const percentage = mult(100)
```

**Test**

```javascript test.mjs
Test('percentage', () => {
	assert.equal(1, percentage(0.01))
})
```

---

**signum**

Returns the sign of the number. -1 if negative, 1 if positive, 0 otherwise.

```javascript index.mjs
export function signum (x) {
	if (x === 0) return 0
	else if (x < 0) return -1
	else if (x > 0) return 1
}
```

**Test**

```javascript test.mjs
Test('signum', () => {
	assert.deepEqual([1, 0, -1], [4839720, 0, -Infinity].map(signum))
})
```

# Iterables

**StopIteration**

A symbol indicating the end of an iteration. Like Python's StopIteration.

<https://docs.python.org/3/library/exceptions.html#StopIteration>

```javascript index.mjs
export const StopIteration = Symbol()
```

---

**isIterable**

Returns true if x is iterable.

```javascript index.mjs
export const isIterable = x => x !== null && x !== undefined && x[Symbol.iterator] instanceof Function
```

**Test**

```javascript test.mjs
Test('isIterable', () => {
	assert.equal(false, isIterable(false))
	assert.equal(false, isIterable({}))
	assert.equal(true, isIterable(''))
	assert.equal(true, isIterable([]))
	assert.equal(true, isIterable(new Map()))
	assert.equal(true, isIterable(new Set()))
	assert.equal(true, isIterable((function* () {})()))
})
```

---

**iter**

For any iterable, returns its iterator. If it's already an iterator, returns itself. Like Python's iter.

<https://docs.python.org/3/library/functions.html#iter>

```javascript index.mjs
export const iter = x => x[Symbol.iterator]()
```

**Test**

```javascript test.mjs
Test('iter', () => {
	assert.equal(true, 'next' in iter(''))
	assert.equal(true, 'next' in iter([]))
	assert.equal(true, 'next' in iter(new Map()))
	assert.equal(true, 'next' in iter(new Set()))
})
```

---

**inside**

Test if an element `x` is inside `xs`. The definition of "inside" depends on the type of `xs`:

- For null or undefined, always false
- For Arrays, test if `x` is an element of `xs`
- For Strings, test if `x` is a substring of `xs`
- For Ranges, test if `x` is inside the range
- For Sets, test if the set has `x`
- For Maps, test if the map has a key `x`
- For Objects. test if the object has a property `x`
- Otherwise false

```javascript index.mjs
export const inside = xs => x => {
	if (xs === null || xs === undefined) return false
	switch (xs.constructor) {
		case Array:
		case String:
		case Range:
			return xs.includes(x)

		case Set:
		case Map:
			return xs.has(x)

		case Object:
			return xs.hasOwnProperty(x)

		default:
			return false
	}
}
```

**Test**

```javascript test.mjs
Test('inside', () => {
	assert.equal(false, inside(null)(1))
	assert.equal(true, inside('32123')('1'))
	assert.equal(true, inside([3,2,1])(1))
	assert.equal(true, inside(new Set([3,2,1]))(1))
	assert.equal(true, inside(new Map([[1, 1], [2, 2], [3, 3]]))(1))
})
```

---

**outside**

The boolean inversion of `inside`.

```javascript index.mjs
export const outside = B1(not)(inside)
```

**Test**

```javascript test.mjs
Test('outside', () => {
	assert.equal(true, outside(null)(4))
	assert.equal(true, outside('32123')('4'))
	assert.equal(true, outside([3,2,1])(4))
	assert.equal(false, outside(new Set([3,2,1]))(3))
	assert.equal(true, outside(new Map([[1, 1], [2, 2], [3, 3]]))(4))
})
```

---

**has**

`inside` but takes its arguments in reverse. Tests whether `xs` contains `x`.

```javascript index.mjs
export const has = C(inside)
```

**Test**

```javascript test.mjs
Test('has', () => {
	assert.equal(false, has(1)(null))
	assert.equal(true, has('1')('32123'))
	assert.equal(true, has(1)([3,2,1]))
	assert.equal(true, has(1)(new Set([3,2,1])))
	assert.equal(true, has(1)(new Map([[1, 1], [2, 2], [3, 3]])))
})
```

---

**hasnt**

The boolean inversion of `has`.

```javascript index.mjs
export const hasnt = C(outside)
```

**Test**

```javascript test.mjs
Test('hasnt', () => {
	assert.equal(true, hasnt(4)(null))
	assert.equal(true, hasnt('4')('32123'))
	assert.equal(true, hasnt(4)([3,2,1]))
	assert.equal(false, hasnt(3)(new Set([3,2,1])))
	assert.equal(true, hasnt(4)(new Map([[1, 1], [2, 2], [3, 3]])))
})
```

---

**flatten**

Flattens an iterable of iterables `n` levels.

```javascript index.mjs
export const flatten = n => function* (xs) {
	for (const x of xs)
		if (n > 0 && isIterable(xs)) yield* flatten(n-1)(x)
		else yield x
}
```

---

**enumerate**

Creates a generator that yields duads in the form [i, x], where i is an incrementing index, and x is the value. Like Python's enumerate.

<https://docs.python.org/3/library/functions.html#enumerate>

```javascript index.mjs
export function* enumerate (xs) { let i = 0 ; for (const x of xs) yield [i++, x] }
```

---

**fold**

Implementations of left and right folds.

Reduces (compresses) a sequence of items to a single item. This works by combining two items to one item, which is the accumulated item. Then combines the accumulated item to a third item, and so on, and so forth.

`foldl` gives the accumulated value first, while `foldr` gives it second.

```javascript index.mjs
export const foldl = f => i => xs => { let a = i ; for (const x of xs) a = f(a)(x) ; return a }
export const foldr = f => i => xs => { let a = i ; for (const x of xs) a = f(x)(a) ; return a }
```

---

**scan**

Identical to fold, but yields its intermediate values. The final value will be identical to fold's.

```javascript index.mjs
export const scanl = f => i => function* (xs) {
	let a = i
	for (const x of xs) {
		a = f(a)(x)
		yield a
	}
}
export const scanr = f => i => function* (xs) {
	let a = i
	for (const x of xs) {
		a = f(x)(a)
		yield a
	}
}
```

---

**map**

Iterates over a sequence of items and returns a new sequence whose every item is passed through the callback function f.

```javascript index.mjs
export const map = f => function* (xs) { for (const x of xs) yield f(x) }
```

---

**filter**

Iterates over a sequence of items and returns a new sequence only containing items that pass through the filter function f. When f(x) is true, the item passes through the filter.

```javascript index.mjs
export const filter = f => function* (xs) { for (const x of xs) if (f(x)) yield x }
```

---

**find**

Finds a single item for which f(x) is true. Otherwise, returns null.

```javascript index.mjs
export const find = f => xs => { for (const x of xs) if (f(x)) return x ; return null }
```

---

**find_many**

```javascript index.mjs
export const find_many = (...fs) => foldr(x => tap(xs => {
	const i = fs.findIndex(T(x))
	if (i === -1) return xs
	xs[i] = x
	fs[i] = K(false)
}))(construct(K(null), fs.length))
```

**Test**

```javascript test.mjs
Test('find_many', () => {
	const xs = [0, 1, 2, 3, 4, 5]
	assert.deepEqual([1, 2, 5], find_many(is(1), is(2), is(5))(xs))
})
```

---

**find_index**

Finds a single index of an item for which f(x) is true. Otherwise, returns null.

```javascript index.mjs
export const find_index = f => xs => { for (const [i, x] of enumerate(xs)) if (f(x)) return i ; return null }
```

---

**every**

Iterates through a sequence xs, passing every item x through the function f. If f(x) is true for every item, returns true. Otherwise, returns false.

```javascript index.mjs
export const every = f => xs => { for (const x of xs) if (!f(x)) return false ; return true }
```

---

**some**

Iterates through a sequence xs, passing every item x through the function f. If f(x) is true for at least one item, returns true. Otherwise, returns false.

```javascript index.mjs
export const some = f => xs => { for (const x of xs) if (f(x)) return true ; return false }
```

---

**seq**

Returns a sequence of integers in the interval [a, b]. So seq(4, 10) yields 4, 5, 6, 7, 8, 9, 10.

```javascript index.mjs
export function* seq(start, end) { for (let x = start; x <= end; x++) yield x }
```

---

**each**

Loops through a sequence of items xs, calling f(x) for each item x. Then return xs. This is useful for performing side effects on arrays, as Array.prototype.forEach cannot be chained, since it returns undefined.

```javascript index.mjs
export const each = f => tap(xs => { for (const x of xs) f(x) })
```

---

**apply**

given an array of functions `fs`, apply the argument `x` to each of them and return an array of `[f1(x), f2(x), f3(x)]`

```javascript index.mjs
export const apply = D(C(array_map))(I)(T)
```

---

**limit**

Yields the first n items of sequence xs.

```javascript index.mjs
export const limit = n => function* (xs) {
	let i = 0
	for (const x of xs) {
		yield x
		i++
		if (i === n) break
	}
}
```

---

**ungroup**

Ungroups grouped objects generated by `group`.

```javascript index.mjs
export function* ungroup(x) {
	if (Array.isArray(x)) yield* x
	else for (const v of Object.values(x))
		yield* ungroup(v)
}
```

---

**optimise**

Finds and returns the optimal value key(x) of sequence xs. To determine whether a value is optimal, the function comp is used, with identity a -> b -> Boolean where a is the current (local) optimal value, and b is the current value being examined.

```javascript index.mjs
export const optimise = comp => key => xs => {
	const iterator = iter(xs)
	let m = iterator.next()
	if (m.done) return null
	m = m.value
	let mv = key(m)
	for (const x of iterator) {
		let xv = key(x)
		if ((comp)(mv)(xv)) {
			m = x
			mv = xv
		}
	}
	return m
}
export const maximum = optimise(gt)
export const minimum = optimise(lt)
```

---

**mapMatch**

Receives an array of functions fs and an array of items xs of equal length. The first element of xs is applied to the first function of fs, and so on for the remaining items.

```javascript index.mjs
export const mapMatch = fs => function* (xs) {
	const fiter = iter(fs)
	for (const x of xs)
		yield fiter.next().value(x)
}
```

---

**sum**

Returns the sum of a sequence of numbers.

```javascript index.mjs
export const sum = foldr(add)(0)
```

---

**len**

Returns the size of a sequence. If it can be easily determined, doesn't loop through the sequence. Otherwise, loops through the sequence and increments a counter by one for each iteration.

```javascript index.mjs
export function len(x) {
	if (x === null || x === undefined) return 0
	switch (x.constructor) {
		case String:
		case Array:
			return x.length
			break

		case Map:
		case Set:
			return x.size
			break

		case Object:
			return Object.keys(x).length
			break

		default:
			if (isIterable(x)) {
				let i = 0
				for (const y of x) i++
				return i
			} else return 0
			break
	}
}
```

---

**empty**

Returns true if a sequence has a length of zero.

```javascript index.mjs
export const empty = B(is(0))(len)
```

**Test**

```javascript test.mjs
Test('empty', () => {
	assert.equal(true, empty({}))
	assert.equal(true, empty([]))
	assert.equal(true, empty(new Set()))
	assert.equal(true, empty(new Map()))
	assert.equal(false, empty({ x: 1 }))
})
```

---

**average**

returns the average value of a sequence of numbers

```javascript index.mjs
export const average = S(div)(len)(sum)
```

**Test**

```javascript test.mjs
Test('average', () => {
	assert.equal(2, average([1,2,3]))
	assert.equal(2, average(new Set([1,2,3])))
})
```

---

**batch**

Allows us to complete a very long-running function without locking the browser. It accepts a function f, a very large sequence a, and a batch size n. f will be called in batches of n at a time, then execute the remaining in the next browser tick asynchronously. It returns a promise which resolves when all of a has been executed.

The function f has signature a -> b -> c where a is the current value being iterated upon and b is the value that has been calculated so far. c becomes the new calculated value. It's similar to foldr.

```javascript index.mjs
export const batch = (f, a, n=1000) => xs => new Promise(yes => {
	tick(iter(xs))
	function tick(xs) {
		let i = 0
		while (i++ < n) {
			const x = xs.next()
			if (x.done) return yes(a)
			else a = f(x.value)(a)
		}
		next_tick(() => tick(xs))
	}
})
```

---

**count**

Returns an object counting how many times each element x appears in a sequence.

```javascript index.mjs
export const count = foldr(x => tap(xs => {
	if (!xs.hasOwnProperty(x)) xs[x] = 0
	xs[x]++
}))({})
```

---

**next**

Returns the next item of iterator x. If there is no next item, throws StopIteration.

```javascript index.mjs
export function next(x) {
	const v = x.next()
	if (v.done === true) throw StopIteration
	return v.value
}
```

**Test**

```javascript test.mjs
Test('next', () => {
	const it = iter([1,2,3])
	assert.equal(1, next(it))
	assert.equal(2, next(it))
	assert.equal(3, next(it))
})
```

---

**early**

Given a sequence xs, return the first element x for which the function f(x) is true. Otherwise, return the very last element of xs. Essentially, it ends a sequence prematurely.

```javascript index.mjs
export const early = f => xs => {
	let latest = null
	for (const x of xs)
		if (f(x)) return x
		else latest = x
	return latest
}
```

**Test**

```javascript test.mjs
Test('early', () => {
	assert.equal(null, early(is(null))([1,2,3,4,null,5,6,7]))
	assert.equal(7, early(is(null))([1,2,3,4,5,6,7]))
})
```

---

**unshift, append**

Prefix a sequence with another sequence. Conversely, appends a sequence to another sequence.

```javascript index.mjs
export const unshift = a => function* (b) { yield* a ; yield* b }
export const append = C(unshift)
```

**Test**

```javascript test.mjs
Test('unshift', () => {
	assert.deepEqual([1,2,3], Array.from(unshift([1])([2,3])))
})

Test('append', () => {
	assert.deepEqual([1,2,3], Array.from(append([2,3])([1])))
})
```

# Promises

**sleep**

If used in an async function, pauses execution of that function for x milliseconds.

```javascript index.mjs
export const sleep = x => new Promise(f => setTimeout(f, x))
```

---

**then**

Curried implementation of Promise.prototype.then.

```javascript index.mjs
export const then = f => x => x.then(f)
```

---

**pcatch**

Curried implementation of Promise.prototype.catch.

```javascript index.mjs
export const pcatch = f => x => x.catch(f)
```

---

**cache**

Caches the result of a complicated function f. Multiple calls to the cached function will not execute again; the cached result will be returned.

```javascript index.mjs
export const cache = f => {
	let cached = null
	return () => cached || f().then(x => cached = Promise.resolve(x))
}
```

# Timing

Executes f in the next "tick" of the event loop.

**next_tick**

```javascript index.mjs
export const next_tick = f => setTimeout(f, 0)
```

---

A benchmarking function. Runs a function n times and prints how long it took to complete.

**benchmark**

```javascript index.mjs
export function benchmark(f, n=1e3) {
	const now = Date.now()
	for (let i = 0; i < n; i++) f(i)
	console.debug(Date.now() - now)
}
```

---

**Looper**

Provides a clean interface to setInterval. Runs function f every ms milliseconds, and manages the interval id internally, not exposing it to the programmer.

constructor(Function f, Number ms): initialises the object with function f and interval duration ms (in milliseconds).

start -> this: start the interval. If the interval has already started, stop the interval and restart it.

stop -> this: stop the interval if it running.

```javascript index.mjs
export class Looper {
	constructor(f, ms) {
		this.f = f
		this.ms = ms
		this.id = null
	}

	start() {
		if (this.id !== null) this.stop()
		this.id = setInterval(this.f, this.ms)
		return this
	}

	stop() {
		if (this.id !== null) {
			clearInterval(this.id)
			this.id = null
		}
		return this
	}
}
```

---

**Timer**

Identical interface as Looper, but for setTimeout.

```javascript index.mjs
export class Timer {
	constructor(f, ms) {
		this.f = f
		this.ms = ms
		this.id = null
	}

	start() {
		if (this.id !== null) this.stop()
		this.id = setTimeout(this.f, this.ms)
		return this
	}

	stop() {
		if (this.id !== null) {
			clearTimeout(this.id)
			this.id = null
		}
		return this
	}
}
```

---

**debounce**

Implements debounce delay. Executes f with the received event, but only if at least n milliseconds have passed.

```javascript index.mjs
export function debounce(f, n=300) {
	let i = null
	return function(x) {
		if (i) clearTimeout(i)
		i = setTimeout(K1(f)(x), n)
	}
}
```

**Test**

```javascript test.mjs
```

# Sets

**union**

```javascript index.mjs
export function union(sets) {
	const s = new Set()
	for (const set of sets)
		for (const x of set)
			s.add(x)
	return s
}
```

**Test**

```javascript test.mjs
Test('union', () => {
	assert.deepEqual(new Set([1,2,3,4,5]), union([ new Set([1,2]), new Set([1,3]), new Set([2,3,4,5]) ]))
})
```

# DOM

```javascript index.mjs
export const $ = (q, dom=document) => dom.querySelector(q)
export const $$ = (q, dom=document) => Array.from(dom.querySelectorAll(q))
export const on_enter = when(x => x.keyCode === 13)
export const on_ctrl_enter = when(x => x.keyCode === 13 && x.ctrlKey)

export function EL(name, attrs=null, children=null) {
	const elem = document.createElement(name)
	if (attrs)
		for (const [k, v] of Object.entries(attrs))
			elem[k] = v
	if (children)
		for (const x of children)
			elem.appendChild(x instanceof Node ? x : document.createTextNode(str(x)))
	return elem
}
```

# Duad

Duads are arrays of exactly two elements. They can also be thought as cons cells. These are helper functions for dealing with duads. Noteably, Object.entries, Object.fromEntries deal with duads.

```javascript index.mjs
export const Duad = (a, b) => [a, b]
```

**Test**

```javascript test.mjs
Test('duad', () => {
	assert.deepEqual([1,2], Duad(1,2))
})
```

---

**Duad.prefix, Duad.suffix**

Create a duad from value x with the prefix (or suffix) v.

```javascript index.mjs
Duad.prefix = a => b => [a, b]
Duad.suffix = a => b => [b, a]
```

**Test**

```javascript test.mjs
Test('duad prefix', () => {
	assert.deepEqual([[1,1],[1,2],[1,3]], [1,2,3].map(Duad.prefix(1)))
})

Test('duad suffix', () => {
	assert.deepEqual([[1,1],[2,1],[3,1]], [1,2,3].map(Duad.suffix(1)))
})
```

---

**Duad.map_first, Duad.map_second**

Changes only the first or second element of a sequence of duads.

```javascript index.mjs
Duad.map_first = f => map(x => [f(x[0]), x[1]])
Duad.map_second = f => map(x => [x[0], f(x[1])])
```

**Test**

```javascript test.mjs
Test('duad map first', () => {
	const inc = x => x+1
	assert.deepEqual([[2,1],[2,2],[2,3]], Array.from(Duad.map_first(inc)([[1,1],[1,2],[1,3]])))
})

Test('duad map second', () => {
	const inc = x => x+1
	assert.deepEqual([[1,2],[2,2],[3,2]], Array.from(Duad.map_second(inc)([[1,1],[2,1],[3,1]])))
})
```

---

**Duad.filter_first, Duad.filter_second**

Filters a sequence of duads based only on the first or second element.

```javascript index.mjs
Duad.filter_first = f => filter(B(f)(first))
Duad.filter_second = f => filter(B(f)(second))
```

**Test**

```javascript test.mjs
Test('duad filter first', () => {
	const even = x => x % 2 === 0
	assert.deepEqual([[2,1]], Array.from(Duad.filter_first(even)([[1,1],[2,1],[3,1]])))
})

Test('duad filter second', () => {
	const even = x => x % 2 === 0
	assert.deepEqual([[1,2]], Array.from(Duad.filter_second(even)([[1,1],[1,2],[1,3]])))
})
```

---

**Duad.combine.**

Combines a duad based on the results of a binary function f.

```javascript index.mjs
Duad.combine = f => S(f)(first)(second)
```

**Test**

```javascript test.mjs
Test('duad combine', () => {
	assert.equal(3, Duad.combine(add)([1,2]))
})
```

---

**Duad.is**

Returns `true` if a duad is the same as another duad.

```javascript index.mjs
Duad.is = a => b => first(a) === first(b) && second(a) === second(b)
```

**Test**

```javascript test.mjs
Test('duad.is', () => {
	assert.equal(true, Duad.is([1,'yo'])([1, 'yo']))
	assert.equal(false, Duad.is([1, {}])([1, {}]))
})
```

---

**Duad.flip**

Flips a duad. The first item becomes the second, and the second becomes the first.

```javascript index.mjs
Duad.flip = Su(Duad, second, first)
```

**Test**

```javascript test.mjs
Test('duad.flip', () => {
    assert.deepEqual([2,1], Duad.flip([1,2]))
})
```

# Strings

**split**

Curried implements of `String.prototype.split`.

```javascript index.mjs
export const split = a => b => b.split(a)
```

**Test**

```javascript test.mjs
Test('split', () => {
	const x = '1 2 3'
	assert.deepEqual(x.split(' '), split(' ')(x))
})
```

---

**trim**

Curried implementation of `String.prototype.trim`.

```javascript index.mjs
export const trim = x => x.trim()
```

**Test**

```javascript test.mjs
Test('trim', () => {
	const x = '	  1234 '
	assert.equal(x.trim(), trim(x))
})
```

---

**startsWith**

Curried implementation of `String.prototype.startsWith`.

```javascript index.mjs
export const startsWith = a => b => b.startsWith(a)
```

**Test**

```javascript test.mjs
Test('startsWith', () => {
	const x = 'abcd'
	assert.equal(x.startsWith('ab'), startsWith('ab')(x))
})
```

---

**endsWith**

Curried implementation of `String.prototype.endsWith`

```javascript index.mjs
export const endsWith = a => b => b.endsWith(b)
```

**Test**

```javascript test.mjs
Test('endsWith', () => {
	const x = 'abcd'
	assert.equal(x.endsWith('cd'), endsWith('cd')(x))
})
```

---

**startsWithAny**

Like `startsWith`, but accepts multiple strings `xs` to check against. If the string `x` starts with any of member of `xs`, return true.

```javascript index.mjs
export const startsWithAny = xs => x => xs.map(startsWith).some(T(x))
```

**Test**

```javascript test.mjs
Test('startsWithAny', () => {
	const x = 'America'
	assert.equal(true, startsWithAny(['yo', 'lo', 'Amer'])(x))
})
```

---

Similar to `startsWithAny`, but using `endsWith` instead.

**endsWithAny**

```javascript index.mjs
export const endsWithAny = xs => x => xs.map(endsWith).some(T(x))
```

**Test**

```javascript test.mjs
Test('endsWithAny', () => {
	const x = 'America'
	assert.equal(true, endsWithAny(['yo', 'lo', 'ica'])(x))
})
```

---

**str**

Return the string representation of `x`.

```javascript index.mjs
export const str = x => ''+x
```

**Test**

```javascript test.mjs
```

# Et cetera

**getMany**

Get several keys `ks` of `x`. For example:

	getMany('x', 'y')({ x: 1, y : 2})

returns `[1, 2]`

```javascript index.mjs
export const getMany = (...ks) => x => ks.map(k => get(k)(x))
```

**Test**

```javascript test.mjs
Test('getMany', () => {
	assert.deepEqual([1, 2, 3], getMany('x', 'y', 'z')({ x: 1, y: 2, z: 3 }))
})
```

---

**has_one**

Returns true if an array xs has at least one item from ys. In other words, checks if the intersection of the two arrays is non-empty. Example:

```javascript index.mjs
export const has_one = D(C(some))(I)(inside)
```

**Test**

```javascript test.mjs
Test('has_one', () => {
	assert.equal(true, has_one('345')('123'))
	assert.equal(false, has_one('345')('12'))
})
```

---

**print**

```javascript index.mjs
export const print = tap(console.log)
```

**Test**

```javascript test.mjs
Test('print', () => {
	assert.equal('test', print('test'))
})
```

---

**assert**

```javascript index.mjs
export function assert(condition, msg='Assert failed') {
	if (!condition) throw new Error(msg)
	else return condition
}
```
