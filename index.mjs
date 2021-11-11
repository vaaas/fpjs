export function assert(condition, msg='Assert failed') {
    if (!condition) throw new Error(msg)
    else return condition
}
