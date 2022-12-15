import { ref } from 'vue'
import useSupabase from '../composables/UseSupabase'

const { supabase } = useSupabase()



export default function useAuthUser() {
    const user = ref(null)

    supabase.auth.onAuthStateChange((e, session) => {
        user.value = supabase.auth.user()
    })  

    const reloadAuth = async () => {
        user.value = supabase.auth.user()
    }
    
    const loginEmailPassword = async (email, password) => {
        console.log("TEST")
        const data = await supabase.auth.signIn({ email, password })
        console.log(data)
        return data
    }

    const logInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signIn({
            provider: 'google',
        }, {
            redirectTo: `${window.location.hostname + window.location.port == 8000 ? '': window.location.port}/login`
        })
        return data
    }

    const registerUser = async (email, password) => {
        const data = await supabase.auth.signUp({ email, password })
        return data
    }

    const logout = async () => {
        return await supabase.auth.signOut()
    }

    const authenticate = (accessToken) => {
        return supabase.auth.setAuth(accessToken)
    }

    const setPassword = async (newPassword) => {
        return await supabase.auth.update({ password: newPassword })
    }

    const userIsLoggedIn = () => {
        return user.value
    }

    const setAuthStateChangedListener = (listener) => {
        return supabase.auth.onAuthStateChange(listener)
    }

    const getUser = userIsLoggedIn

    return {
        user,
        loginEmailPassword,
        logout,
        authenticate,
        setPassword,
        userIsLoggedIn,
        setAuthStateChangedListener,
        getUser,
        registerUser,
        logInWithGoogle,
        reloadAuth
    }

}