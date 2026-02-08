<template>
    <div style='height: 100%;'>
        <notification-provider>
            <div v-if='isAuthenticated' style='height: 100%;display: flex;flex-direction: column;'>
                <Navbar id='navbar' :authenticated='true'/>
                <div id='theloader' style='display: flex; flex: 1; max-width: 100%; padding: 0px; overflow-y: auto; overflow-x: hidden; position: relative;' v-loading='globalLoader'>
                    <div id='page-content'>
                        <error-boundary @error-received='errorPage = true'>
                            <error-page v-if='errorPage' message='Something went wrong.'></error-page>
                            <router-view v-else />
                        </error-boundary>
                    </div>
                </div>
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

import useNotificationService from './composables/ui/useNotificationService'

const notificationService = useNotificationService()

const { userIsLoggedIn } = useAuthUser()

const { globalLoader } = useGlobalLoader()

const reloading = ref(false)

const errorPage = ref(false)

const handleGoogleCredentials = (response) => {
    console.log(response)
}

const isAuthenticated = computed(() => {
    reloading.value = false
    return userIsLoggedIn()
})

const handleMounted = () => {
    reloading.value = true
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