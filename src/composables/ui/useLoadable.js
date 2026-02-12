import { ref, onMounted } from 'vue'

export default function useLoadable(loadingFunction, options = { initialValue: null, autoload: false, onError: null, onData: null }) {

    const currentState = ref({
        data: options.initialValue,
        status: 'not-started',
        error: null
    })

    const _setValue = (value) => {
        if (value.error) {
            currentState.value = {
                ...currentState.value,
                status: 'error',
                error: value.error
            }
            if (options.onError) {
                options.onError(value.error)
            }
        }
        else {
            currentState.value = {
                ...currentState.value,
                status: 'data',
                error: null,
                data: value.value
            }
            if (options.onData) {
                options.onData(value.value)
            }
        }
    }

    const load = async (...args) => {
        currentState.value.status = 'loading'
        
        try {
            const result = await loadingFunction(currentState.value.data,...args)

            _setValue({
                value: result,
                status: 'data',
                error: null
            })

            return result

        } catch(error) {
            _setValue({
                error: error,
                status: 'error',
                value: null
            })
        }
        
    }

    const loadSilently = async (...args) => {

        try {
            const result = await loadingFunction(currentState.value.data,...args)

            _setValue({
                value: result,
                status: 'data',
                error: null
            })

            return result

        } catch(error) {
            _setValue({
                error: error,
                status: 'error',
                value: null
            })
        }

    }

    const loadWithFunction = async (newLoadFunction) => {
        currentState.value.status = 'loading'
        
        try {
            const result = await newLoadFunction(currentState.value.data)

            _setValue({
                value: result,
                status: 'data',
                error: null
            })

            return result

        } catch(error) {
            _setValue({
                error: error,
                status: 'error',
                value: null
            })
        }

    }

    const loadWithVoidFunction = async (newLoadFunction) => {
        currentState.value.status = 'loading'
        
        try {
            await newLoadFunction(currentState.value.data)
            currentState.value.status = 'data'
            if (options.onData) {
                options.onData(currentState.value.data)
            }

        } catch(error) {
            _setValue({
                error: error,
                status: 'error',
                value: null
            })
        }
    }

    if (options.autoload) {
        onMounted(() => {
            load()
        })
    }

    return {
        load,
        currentState,
        loadSilently,
        loadWithFunction,
        loadWithVoidFunction,
        get error() { return currentState.value.error },
        get value() { return currentState.value.data },
        set value(newValue) { currentState.value.data = newValue },
        get status() { return currentState.value.status },
        get isLoading() { return currentState.value.status == 'loading' }
    }

}