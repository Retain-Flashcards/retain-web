import { ref } from 'vue'
import useSupabase from '../composables/UseSupabase'

const { supabase } = useSupabase()

const user = ref(null)

export default function useAuthUser() {
    
    const loginEmailPassword = async (email, password) => {
        const data = await supabase.auth.signIn({ email, password })
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
        return supabase.auth.user()
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
        registerUser
    }

}