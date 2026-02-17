import { ref } from 'vue'
import useSupabase from './UseSupabase'

const { supabase } = useSupabase()

export default function useAuthUser() {
    const user = ref(undefined)

    // v2: onAuthStateChange returns { data: { subscription } }
    supabase.auth.onAuthStateChange((event, session) => {
        user.value = session?.user ?? undefined
    })

    const reloadAuth = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        user.value = currentUser
    }
    
    const loginEmailPassword = async (email, password, captchaToken) => {
        // v2: signIn → signInWithPassword, captcha in options
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: { captchaToken }
        })
        if (error) throw error
        return data
    }

    const logInWithGoogle = async () => {
        // v2: signIn with provider → signInWithOAuth
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/login`
            }
        })
        if (error) throw error
        return data
    }

    const registerUser = async (email, password, captchaToken) => {
        // v2: captchaToken moves into options object
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { captchaToken }
        })
        if (error) throw error
        return data
    }

    const logout = async () => {
        return await supabase.auth.signOut()
    }

    const setPassword = async (newPassword) => {
        // v2: update → updateUser
        return await supabase.auth.updateUser({ password: newPassword })
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
        setPassword,
        userIsLoggedIn,
        setAuthStateChangedListener,
        getUser,
        registerUser,
        logInWithGoogle,
        reloadAuth
    }
}