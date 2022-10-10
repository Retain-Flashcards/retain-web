<template>
    <div style='height: 100%;'>
        <div v-if='isAuthenticated' style='height: 100%;display: flex;flex-direction: column;'>
            <Navbar id='navbar' :authenticated='true'/>
            <div id='theloader' style='display: flex; flex: 1; max-width: 100%; padding: 0px;' v-loading='globalLoader'>
                <div id='page-content'>
                    <router-view />
                </div>
            </div>
        </div>
        <div v-else style='height: 100%; flex: 1;'>
            <Navbar id='navbar'/>
            <el-row align='middle' justify='center' style='flex: 1; height: 100%;'>
                <el-col :span='8'></el-col>
                <el-col :span='8'>
                    <router-view />
                </el-col>
                <el-col :span='8'></el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import useAuthUser from './composables/UseAuthUser'
import useGlobalLoader from './composables/UseGlobalLoader'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
const { userIsLoggedIn, getUser } = useAuthUser()

const { globalLoader } = useGlobalLoader()

export default {
    setup() {
        return {
            globalLoader
        }
    }, 
    data() {
        return {
            reloading: false
        }
    },
    mounted() {
        this.reloading = true
    },
    computed: {
        isAuthenticated() {
            this.reloading = false
            return userIsLoggedIn()
        }
    },
    components: {
        Navbar,
        Sidebar
    }
}
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