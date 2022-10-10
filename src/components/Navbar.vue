<template>
    <div class='navbar-container'>
        <div class='header-link' style='display: flex; align-items: center;height: 100%;' @click='visitHome'>
            <img src='../assets/flashcards-logo.png' width='45' height='45'/>
            <el-divider direction='vertical' class='el-divider'/>
            <h3>Retain</h3>
        </div>
        <div class='flex-spacer'></div>
        <el-button v-if='authenticated' type='danger' style='margin-right: 25px;' :underline='false' @click.prevent='handleLogOut' plain>Log Out</el-button>
    </div>
</template>

<script>
import useAuthUser from '../composables/UseAuthUser'

const { logout } = useAuthUser()

export default {
    props: ['authenticated'],
    methods: {
        handleLogOut() {
            logout()
        },
        visitHome() {
            this.$router.push({
                name: 'Home'
            })
        }
    }
}

</script>

<style scoped>
    div.navbar-container {
        display: flex;
        flex-direction: row;
        height: 70px;
        align-items: center;
        border-bottom: #EEEEEE 3px solid;
    }
    img {
        max-width: 100%;
        max-height: 100%;
        margin-left: 10px;
    }
    h3 {
        margin-left: 5px;
        color: #606266;
        font-size: 20px;
    }

    .el-divider {
        max-height: 60%;
        margin-left: 10px;
        margin-right: 5px;
        justify-content: center;
    }

    .header-link:hover {
        cursor: pointer;
    }
</style>