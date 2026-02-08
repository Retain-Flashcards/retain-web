import { inject } from 'vue'

const useKeyUpBinding = (key, callback, exclusive = false) => {
    const addKeyUpBinding = inject('addKeyUpBinding')
    addKeyUpBinding(key, callback, exclusive)
}

const useKeyDownBinding = (key, callback, exclusive = false) => {
    const addKeyDownBinding = inject('addKeyDownBinding')
    addKeyDownBinding(key, callback, exclusive)
}
 
export {
    useKeyUpBinding,
    useKeyDownBinding
}
