import { ref } from 'vue'

export default function useLoadable(loadingFunction, initialValue) {

    const currentState = ref({
        value: initialValue,
        status: 'not-started',
        error: null
    })

    const load = async (...args) => {
        currentState.value.status = 'loading'
        
        try {
            const result = await loadingFunction(currentState.value.value,...args)

            currentState.value = {
                value: result,
                status: 'data',
                error: null
            }

            return result

        } catch(error) {
            currentState.value.status = 'error'
            currentState.value.error = error
        }
        
    }

    const loadSilently = async (...args) => {

        try {
            const result = await loadingFunction(currentState.value.value,...args)

            currentState.value = {
                value: result,
                status: 'data',
                error: null
            }

            return result

        } catch(error) {
            currentState.value.status = 'error'
            currentState.value.error = error
        }

    }

    const loadWithFunction = async (newLoadFunction) => {
        currentState.value.status = 'loading'
        
        try {
            const result = await newLoadFunction(currentState.value.value)

            currentState.value = {
                value: result,
                status: 'data',
                error: null
            }

            return result

        } catch(error) {
            currentState.value.status = 'error'
            currentState.value.error = error
        }

    }

    const loadWithVoidFunction = async (newLoadFunction) => {
        currentState.value.status = 'loading'
        
        try {
            await newLoadFunction(currentState.value.value)
            currentState.value.status = 'data'

        } catch(error) {
            currentState.value.status = 'error'
            currentState.value.error = error
        }
    }

    return {
        load,
        currentState,
        loadSilently,
        loadWithFunction,
        loadWithVoidFunction,
        error: () => currentState.value.error,
        value: () => currentState.value.value,
        status: () => currentState.value.status,
        isLoading: () => currentState.value.status == 'loading'
    }

}