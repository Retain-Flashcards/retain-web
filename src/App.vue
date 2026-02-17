<template>
    <div v-if='!reloading' style='height: 100%;'>
        <notification-provider>
            <div v-if='isAuthenticated' style='height: 100%;display: flex;flex-direction: column;'>
                <Navbar id='navbar' :authenticated='true'/>
                <paywall-provider>
                    <div id='theloader' style='display: flex; flex: 1; max-width: 100%; padding: 0px; overflow-y: auto; overflow-x: hidden; position: relative;' v-loading='globalLoader'>
                        <div id='page-content'>
                            <error-boundary @error-received='errorPage = true'>
                                <error-page v-if='errorPage' message='Something went wrong.'></error-page>
                                <router-view v-else />
                            </error-boundary>
                        </div>
                    </div>
                </paywall-provider>
            </div>
            <div v-else style='height: 100%; flex: 1;'>
                <Navbar id='navbar'/>
                <KeyBindingProvider>
                <el-row align='middle' justify='center' style='flex: 1; height: 100%;'>
                    <el-col :span='8'></el-col>
                    <el-col :span='8'>                        
                            <router-view/>
                    </el-col>
                    <el-col :span='8'></el-col>
                </el-row>
                </KeyBindingProvider>
            </div>
        </notification-provider>
    </div>
    <app-spinner v-else/>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import useAuthUser from './composables/api/UseAuthUser'
import useGlobalLoader from './composables/ui/UseGlobalLoader'
import Navbar from './components/Navbar.vue'
import KeyBindingProvider from './components/basic/providers/KeyBindingProvider.vue'
import NotificationProvider from './components/NotificationProvider.vue'
import ErrorBoundary from './components/basic/errorHandling/ErrorBoundary.vue'
import ErrorPage from './components/basic/errorHandling/ErrorPage.vue'
import AppSpinner from './components/basic/AppSpinner.vue'
import PaywallProvider from './components/PaywallProvider.vue'

import useNotificationService from './composables/ui/useNotificationService'

const notificationService = useNotificationService()

const { userIsLoggedIn, user, setAuthStateChangedListener } = useAuthUser()

const { globalLoader } = useGlobalLoader()

const reloading = ref(true)

const errorPage = ref(false)

const handleGoogleCredentials = (response) => {
    console.log(response)
}

const isAuthenticated = computed(() => {
    reloading.value = false
    return user.value
})

setAuthStateChangedListener((event, session) => {
    if (event == 'SIGNED_OUT') {
        router.push('/login')
    }
    else if (session?.user) {
        reloading.value = false
    }
})

const handleMounted = () => {
}

onMounted(handleMounted)

</script>

<style>

html, body, #app {
    height: 100%;
    padding: 0px;
    margin: 0px;
}

#app {
    display: 'flex';
    flex-direction: column;
}

#lower-content {
    flex: 1;
}

#page-content {
    flex: 1;
    max-width: 100%;
    display: flex;
    flex-direction: column;
}

</style>