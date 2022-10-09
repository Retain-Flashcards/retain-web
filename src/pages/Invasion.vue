<template>
    <div v-if='invasion' style='display: flex; height: 100%; width: 100%; flex-direction: column;'>
        <div style='display: flex; flex-direction: row;'>
            <el-page-header :content='invasion.name' @back='returnToHome' style='padding-bottom: 20px; margin-right: 20px;'></el-page-header>
            <el-tag type='info' :hit='false' :color='invasion.statusColor + "55"' round><span :style='{ color: invasion.statusColor}'><el-icon style='float: left; margin-right: 5px;'><Aim /></el-icon>{{ invasion.status }}</span></el-tag>
            <div class='flex-spacer'></div>
        </div>
        <div id='invasion-content'>
            <div><Sidebar /></div>
            <div><router-view style='padding: 30px;'></router-view></div>
        </div>
    </div>
</template>

<script>
import useInvasionManager from '../model/managers/InvasionManager'
import useGlobalLoader from '../composables/UseGlobalLoader'

import Sidebar from '../components/Sidebar.vue'

const { startGlobalLoading, stopGlobalLoading, globalLoading } = useGlobalLoader()

const invasionManager = useInvasionManager()

export default {
    setup() {
        return { globalLoading }
    },
    mounted() {
        this.loadInvasion()
    },
    data() {
        return {
            invasion: null
        }
    }, 
    methods: {
        loadInvasion() {
            startGlobalLoading()
            invasionManager.getInvasion(this.$route.params.invasionId).then(invasion => this.invasion = invasion).finally(stopGlobalLoading())
        },
        returnToHome() {
            this.$router.push('/')
        }
    },
    components: {
        Sidebar
    }
}

</script>

<style>
#invasion-content {
    display: flex;
    flex: 1;
    flex-direction: row;
    
}
</style>