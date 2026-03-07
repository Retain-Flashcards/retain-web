<template>
    <div class='navbar-container'>
        <div class='header-link' style='display: flex; align-items: center;height: 100%;' @click='visitHome'>
            <img style='margin-left: 20px;' src='../assets/new_logo.png' width='50' height='50'/>
            <h3 style='margin-left: 10px;'>Retain</h3>
        </div>
        <div class='flex-spacer'></div>
        <brand-button size='small' icon='fa-regular fa-circle-question' type='info' :plain='true' style='margin-right: 15px;' @click='emailSupport'>Email Support</brand-button>
        <BrandButton v-if='authenticated' size='small' icon='fa-arrow-right-from-bracket' type='error' style='margin-right: 25px;' @click='handleLogOut' :plain='true'>Log Out</BrandButton>
    </div>
</template>

<script>
import BrandButton from './basic/BrandButton.vue'

import useAuthUser from '../composables/api/UseAuthUser'
import { WindPower } from '@element-plus/icons-vue'

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
        },
        emailSupport(e) {
            window.location.href = 'mailto:info@retaincards.com'
        }
    },
    components: {
        BrandButton
    }
}

</script>

<style scoped>
    div.navbar-container {
        display: flex;
        flex-direction: row;
        height: 50px;
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