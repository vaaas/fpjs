Test('split', () => {
    const x = '1 2 3'
    assert.deepEqual(x.split(' '), split(' ')(x))
})

Test('trim', () => {
    const x = '      1234 '
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


Test('unshift', () => {
    assert.deepEqual([1,2,3], Array.from(unshift([1])([2,3])))
})

Test('append', () => {
    assert.deepEqual([1,2,3], Array.from(append([2,3])([1])))
})
