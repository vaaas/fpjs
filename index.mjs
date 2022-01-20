export const B = a => b => c => a(b(c)) // bluebird - 1 argument
export const B1 = a => b => c => d => a(b(c)(d)) // blackbird - 2 arguments
export const B1u = (a, b) => (c, d) => a(b(c, d)) // blackbird uncurried
export const C = a => b => c => a(c)(b) // cardinal
export const Cu = a => (b, c) => a(c, b) // cardinal uncurried
export const D = a => b => c => d => e => a(b(d))(c(e)) // dovekies
export const Du = (a, b, c) => (d, e) => a(b(d), c(e)) // dovekies uncurried
export const K = a => () => a // kestrel
export const K1 = a => b => () => a(b) // kestrel once removed
export const just = K
export const I = x => x
export const id = I
export const V = a => b => f => f(a)(b) // vireo
export const Vu = (a, b) => f => f(a, b) // vireo uncurried
export const spread = f => x => f(...x)
export const unspread = f => (...x) => f(x)
export const N = o => x => new o(x)
export const S = a => b => c => d => a(b(d))(c(d)) // starling prime
export const Su = (a, b, c) => d => a(b(d), c(d)) // starling prime uncurried
export const T = x => f => f(x) // thrush
export const W = a => b => a(b)(b) // Warbler
export const WS = a => b => a(...b)(...b)
export const Wu = a => b => a(b, b) // Warbler uncurried
export const Q = a => b => c => b(a(c)) // queer bird
export const tap = f => x => { f(x) ; return x }
export const pipe = (x, ...fs) => { for (let i = 0; i < fs.length; i++) x = fs[i](x); return x }
export const arrow = (...fs) => x => { for (let i = 0; i < fs.length; i++) x = fs[i](x); return x }
export const curry = f => a => b => f(a, b)
export const by = (...fs) => (a,b) => {
	for (const f of fs) {
		const xa = f(a)
		const xb = f(b)
		if (xa === xb) continue
		else return xa < xb ? -1 : 1
	}
	return -1
}
export const do_nothing = K(false)
export function waterfall(...fs) {
	let i = 0
	const f = (...xs) => (fs[++i] || do_nothing)(f, ...xs)
	fs[0](f)
}
export const bind = f => x => f.bind(x)
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
export const set = k => v => tap(o => {
	if (o === null || o === undefined) return
	else if (o.constructor === Map) o.set(k, v)
	else o[k] = v
})
export const get_from = C(get)
export const pluck = k => x => (x === null || x === undefined) ? null : x[k]
export const change = (f, ...keys) => tap(x => {
	if (keys.length === 0) keys = Object.keys(x)
	keys.forEach(k => x[k] = f(x[k]))
})
export const update = (a, ...keys) => b => {
	if (keys.length === 0) keys = Object.keys(a)
	for (const k of keys) b[k] = a[k]
	return b
}
export const object_map = f => xs => Object.fromEntries(Object.entries(xs).map(x => f(x, xs)))
export const object_filter = f => xs => Object.fromEntries(Object.entries(xs).filter(x => f(x, xs)))
export const not = a => !a
export const and = a => b => b && a
export const or = a => b => b || a
export function* combinations(...xs) { yield* _combine([], xs) }
function* _combine(head=[], tails=[[]]) {
	if (tails.length === 0) yield head
	else for (const x of first(tails)) yield* _combine([...head, x], tail(tails))
}
export function* combinations_fn(...fs) { yield* _combine_fn([], fs) }
function* _combine_fn(head=[], fs=[]) {
	if (fs.length === 0) yield head
	else for (const x of first(fs)(head)) yield* _combine_fn([...head, x], tail(fs))
}
export const first = x => x[0]
export const second = x => x[1]
export const last = x => x[x.length-1]
export const head = x => x.slice(0, x.length - 1)
export const tail = x => x.slice(1)
export const slice = (a, b=Infinity) => xs => xs.slice(a, b)
export const array_map = f => x => x.map(f)
export const array_filter = f => x => x.filter(f)
export const array_splice = (a, b) => x => x.splice(a, b)
export const array_take = i => tap(x => x.splice(i, 1))
export const array_get = B(array_map)(get)
export const array_push = x => tap(xs => xs.push(x))
export const pick = x => x[randint(0, x.length)]
export function construct(f, n) {
	const x = []
	for (let i = 0; i < n; i++) x.push(f(i, n, x))
	return x
}
export const join = d => xs => {
	if (xs === null || xs === undefined) return ''
	else if (xs.constructor === Array) return xs.join(d)
	else if (isIterable(xs)) return Array.from(xs).join(d)
	else return ''
}
export const sort = f => x => x.constructor === Array ? x.sort(f) : Array.from(x).sort(f)
export const reverse = x => Array.from(x).reverse()
export const objectify = f => foldr(x => tap(o => o[f(x)] = x))({})
export function swap (xs, a, b) {
	const c = xs[a]
	xs[a] = xs[b]
	xs[b] = c
	return xs
}
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
export const partition = (...fs) => foldr(x => tap(xs => {
	const i = fs.findIndex(T(x))
	if (i !== -1) xs[i].push(x)
}))(construct(() => [], fs.length))
export const is = a => b => a === b
export const like = a => b => a == b
export const isnt = B1(not)(is)
export const null_undefined = x => x === null || x === undefined
export const defined = B(not)(null_undefined)
export const AND = fs => x => fs.every(T(x))
export const OR = fs => x => fs.some(T(x))
export const instance = a => b => b instanceof a
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
export const ifelse = cond => (good, bad) => x => cond(x) ? good(x) : bad(x)
export const when = cond => then => x => cond(x) ? then(x) : x
export const maybeor = ifelse(defined)
export const maybe = when(defined)
export const nothing = when(null_undefined)
export const success = when(x => !(x instanceof Error))
export const failure = when(instance(Error))
export const trycatch = ifelse(x => !(x instanceof Error))
export const valmap = (...xs) => x => {
	const len = xs.length - xs.length % 2
	for (let i = 0; i < len; i += 2)
		if (xs[i] === x) return xs[i+1]
	return len === xs.length ? x : last(xs)
}
export const cond = (...fs) => x => {
	const len = fs.length - fs.length % 2
	for (let i = 0; i < len; i += 2)
		if (fs[i](x)) return fs[i+1](x)
	return len === fs.length ? x : last(fs)(x)
}
export const attempt = f => {
	try { return f() }
	catch (e) { return e }
}
export const reject = (f, m) => x => {
	if (f(x)) throw m(x)
	else return x
}
export function between (x, low, high) { return x >= low && x <= high }
export const cbetween = (low, high) => x => between(x, low, high)
export const gt = a => b => b > a
export const gte = a => b => b >= a
export const lt = a => b => b < a
export const lte = a => b => b <= a
export const pow = a => b => b**a
export const mult = a => b => a*b
export const div = a => b => b/a
export const divisible = a => b => b % a === 0
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
export const addr = C(add)
export const randint = (a, b) => a+Math.floor(Math.random()*(b-a))
export const clamp = (x, min, max) => {
	if (x < min) return min
	else if (x > max) return max
	else return x
}
export const relative = (x, min, max) => (x-min)/(max-min)
export const ceil = (x, n=0) => Math.ceil(x*10**-n)*10**n
export const floor = (x, n=0) => Math.floor(x*10**-n)*10**n
export const minmax = (a, b) => b < a ? [b, a] : [a, b]
export const plus_mod = m => x => x + (m - x % m)
export const rollover = (low, high) => x => {
	if (x < low) return high
	else if (x > high) return low
	else return x
}
export function* naturals() { let i = 0 ; while (true) yield i++ }
export class Range {
	constructor(min, max) {
		this.min = min
		this.max = max
	}

	includes(x) {
		return between(x, this.min, this.max)
	}
}
export const probability = div(100)
export const percentage = mult(100)
export function signum (x) {
	if (x === 0) return 0
	else if (x < 0) return -1
	else if (x > 0) return 1
}
export const StopIteration = Symbol()
export const isIterable = x => x !== null && x !== undefined && x[Symbol.iterator] instanceof Function
export const iter = x => x[Symbol.iterator]()
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
export const outside = B1(not)(inside)
export const has = C(inside)
export const hasnt = C(outside)
export const flatten = n => function* (xs) {
	for (const x of xs)
		if (n > 0 && isIterable(xs)) yield* flatten(n-1)(x)
		else yield x
}
export function* enumerate (xs) { let i = 0 ; for (const x of xs) yield [i++, x] }
export const foldl = f => i => xs => { let a = i ; for (const x of xs) a = f(a)(x) ; return a }
export const foldr = f => i => xs => { let a = i ; for (const x of xs) a = f(x)(a) ; return a }
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
export const map = f => function* (xs) { for (const x of xs) yield f(x) }
export const filter = f => function* (xs) { for (const x of xs) if (f(x)) yield x }
export const find = f => xs => { for (const x of xs) if (f(x)) return x ; return null }
export const find_many = (...fs) => foldr(x => tap(xs => {
	const i = fs.findIndex(T(x))
	if (i === -1) return xs
	xs[i] = x
	fs[i] = K(false)
}))(construct(K(null), fs.length))
export const find_index = f => xs => { for (const [i, x] of enumerate(xs)) if (f(x)) return i ; return null }
export const every = f => xs => { for (const x of xs) if (!f(x)) return false ; return true }
export const some = f => xs => { for (const x of xs) if (f(x)) return true ; return false }
export function* seq(start, end) { for (let x = start; x <= end; x++) yield x }
export const each = f => tap(xs => { for (const x of xs) f(x) })
export const apply = D(C(array_map))(I)(T)
export const limit = n => function* (xs) {
	let i = 0
	for (const x of xs) {
		yield x
		i++
		if (i === n) break
	}
}
export function* ungroup(x) {
	if (Array.isArray(x)) yield* x
	else for (const v of Object.values(x))
		yield* ungroup(v)
}
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
export const mapMatch = fs => function* (xs) {
	const fiter = iter(fs)
	for (const x of xs)
		yield fiter.next().value(x)
}
export const sum = foldr(add)(0)
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
export const empty = B(is(0))(len)
export const average = S(div)(len)(sum)
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
export const count = foldr(x => tap(xs => {
	if (!xs.hasOwnProperty(x)) xs[x] = 0
	xs[x]++
}))({})
export function next(x) {
	const v = x.next()
	if (v.done === true) throw StopIteration
	return v.value
}
export const early = f => xs => {
	let latest = null
	for (const x of xs)
		if (f(x)) return x
		else latest = x
	return latest
}
export const unshift = a => function* (b) { yield* a ; yield* b }
export const append = C(unshift)
export const sleep = x => new Promise(f => setTimeout(f, x))
export const then = f => x => x.then(f)
export const pcatch = f => x => x.catch(f)
export const cache = f => {
	let cached = null
	return () => cached || f().then(x => cached = Promise.resolve(x))
}
export const next_tick = f => setTimeout(f, 0)
export function benchmark(f, n=1e3) {
	const now = Date.now()
	for (let i = 0; i < n; i++) f(i)
	console.debug(Date.now() - now)
}
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
export function debounce(f, n=300) {
	let i = null
	return function(x) {
		if (i) clearTimeout(i)
		i = setTimeout(K1(f)(x), n)
	}
}
export function union(sets) {
	const s = new Set()
	for (const set of sets)
		for (const x of set)
			s.add(x)
	return s
}
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
export const Duad = (a, b) => [a, b]
Duad.prefix = a => b => [a, b]
Duad.suffix = a => b => [b, a]
Duad.map_first = f => map(x => [f(x[0]), x[1]])
Duad.map_second = f => map(x => [x[0], f(x[1])])
Duad.filter_first = f => filter(B(f)(first))
Duad.filter_second = f => filter(B(f)(second))
Duad.combine = f => S(f)(first)(second)
Duad.is = a => b => first(a) === first(b) && second(a) === second(b)
Duad.flip = Su(Duad, second, first)
export const split = a => b => b.split(a)
export const trim = x => x.trim()
export const startsWith = a => b => b.startsWith(a)
export const endsWith = a => b => b.endsWith(b)
export const startsWithAny = xs => x => xs.map(startsWith).some(T(x))
export const endsWithAny = xs => x => xs.map(endsWith).some(T(x))
export const str = x => ''+x
export const getMany = (...ks) => x => ks.map(k => get(k)(x))
export const has_one = D(C(some))(I)(inside)
export const print = tap(console.log)
export function assert(condition, msg='Assert failed') {
	if (!condition) throw new Error(msg)
	else return condition
}