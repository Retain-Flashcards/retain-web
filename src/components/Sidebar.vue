<script setup>
import { Odometer, Cellphone, Search, Folder, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
</script>

<template>
    <div style='display: flex; flex-direction: column;'>
        <el-menu default-active='action-history' @select='handleMenuItemSelected' :collapse='collapsed'>
            <el-menu-item index='action-history'><el-icon><Odometer /></el-icon><template #title>Action History</template></el-menu-item>
            <el-menu-item index='hosts'><el-icon><Cellphone /></el-icon><template #title>Hosts</template></el-menu-item>
            <el-menu-item index='scans'><el-icon><Search /></el-icon><template #title>Scans</template></el-menu-item>
            <el-menu-item index='files'><el-icon><Folder /></el-icon><template #title>Files</template></el-menu-item>
        </el-menu>
        <div class='flex-spacer'></div>
        <el-button @click.prevent='toggleSidebarCollapse' text><el-icon><ArrowRight v-if='collapsed'/><ArrowLeft v-else /></el-icon></el-button>
    </div>
</template>

<script>

export default {
    data() {
        return {
            collapsed: false
        }
    },
    methods: {
        handleMenuItemSelected(index, indexPath, item, routeResult) {
            this.$router.push({
                path: index,
                params: {
                    invasionId: this.$route.params.invasionId
                }
            })
        },
        toggleSidebarCollapse() {
            this.collapsed = !this.collapsed
        }
    }
}

</script>

<style scoped>

div {
    flex: 1;
    border-right: #3f3f3f solid 2px;
    width: 100%;
    height: 100%;
}

</style>