import { inject } from 'vue'

const useKeyUpBinding = (key, callback) => {
    const keyUpBindings = inject('keyUpBindings')
    if (!keyUpBindings) return// throw new Error('useKeyUpBinding requires a KeyBindingProvider component somewhere in the parent tree')
    if (!keyUpBindings[key]) keyUpBindings[key] = []
    keyUpBindings[key].push(callback)
}

const useKeyDownBinding = (key, callback) => {
    const keyDownBindings = inject('keyDownBindings')
    if (!keyDownBindings) return// throw new Error('useKeyDownBinding requires a KeyBindingProvider component somewhere in the parent tree')
    if (!keyDownBindings[key]) keyDownBindings[key] = []
    keyDownBindings[key].push(callback)
}
 
export {
    useKeyUpBinding,
    useKeyDownBinding
}
