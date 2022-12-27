<template>
    <div ref='theContainer' class='card' :style="{ backgroundColor: primaryColor ? primaryColor : 'var(--el-color-primary)', backgroundImage: imgUrl ? `url('` + imgUrl + `')`:'none' }">
        <div :class='`card-container ${imgUrl ? "card-overlay": ""}`' :style="{ backgroundColor: 'var(--el-color-primary-overlay)' }">
            <div class='edit-container' style='flex: 0.2; display: flex; flex-direction: row; margin-right: 20px; margin-left: 15px; margin-top: 15px; align-items: center;'>
                <el-button :class='`${pinned ? "pin-button" : ""}`' @click.stop='() => setPinned(!pinned)' :type='pinned ? "primary":"plain"'  circle ><el-icon><StarFilled v-if='pinned'/><Star v-else/></el-icon></el-button>
                <div class='flex-spacer'></div> 
                <el-dropdown trigger='click' @command='handleMoreCommand'>
                    <el-button @click.stop='() => {}' class='edit-button' type='text' style='color: white; font-size: 25px;'><el-icon><MoreFilled /></el-icon></el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command='edit'>Edit</el-dropdown-item>
                            <el-dropdown-item command='share'>Share</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div style='flex: 0.05;'></div>
            <div class='card-header'>
                <el-button v-if='shared' type='text' style='color: white; font-size: 20px; margin-right: 7px;'><el-icon><Connection /></el-icon></el-button>
                <h3>{{ title }}</h3>
            </div>
    
            <div class='card-content'>
                <div class='new count-item' :style='{ color: "var(--el-color-primary)" }'>
                    <div class='flex-spacer'></div>
                    <h1>{{ newCount }}</h1>
                    <p>New</p>
                    <div class='flex-spacer'></div>
                </div>
                <div class='review count-item' :style='{ color: "var(--el-color-primary-light-4)" }'>
                    <div class='flex-spacer'></div>
                    <h1>{{ reviewCount }}</h1>
                    <p>Review</p>
                    <div class='flex-spacer'></div>
                </div>
            </div>
        </div>
        
    </div>

</template>

<script>
import { MoreFilled, Star, StarFilled, Connection } from '@element-plus/icons-vue'
import { setThemeColor } from '../../utils'
 
export default {
    props: ['onEdit', 'onShare', 'pinned', 'title', 'imgUrl', 'reviewCount', 'newCount', 'setPinned', 'primaryColor', 'shared'],
    updated() {
        if (this.primaryColor) setThemeColor(this.primaryColor, this.$refs.theContainer)
    },
    methods: {
        handleMoreCommand(command) {
            if (command == 'edit') this.onEdit()
            else this.onShare()
        }
    }
}



</script>

<style scoped>

    .card-overlay {
        background: rgba(0,0,0, 0.5);
    }

    .card-container {
        height: 100%;
        width: 100%;
    }

    .card {
        background: var(--el-color-primary);
        border-radius: 15px;
        background-size: cover;
        overflow: hidden;
        display: flex;
        transition: 0.2s;
        box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 10px;
    }
    
    .pin-button {
        background: var(--el-color-primary-light-4);
        border-color: transparent;
    }

    .pin-button:hover {
        background: var(--el-color-primary-light-3);
    }

    .card-container {
        display: flex;
        flex-direction: column;
    }

    .card-header {
        padding-top: 20px;
        padding-left: 20px;
        padding-right: 20px;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        overflow: hidden;
    }

    h3 {
        margin: 0px;
        margin-right: 5px;
        margin-bottom: 10px;
        color: white;
        font-size: 23px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .card:hover {
        transform: scale(1.03);
        cursor: pointer;
        
    }

    .card-content {
        background-color: white;
        display: flex;
        flex: 1;
        flex-direction: row;
        align-items: center;
        border-radius: 0px;
        padding-left: 10px;
        padding-right: 10px;
    }

    .count-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
    }

    .review {
        color: var(--el-color-primary);
    }

    .new {
        color: var(--el-color-danger);
    }

    .flex-spacer {
        flex: 1;
    }

    h1 {
        font-size: 40px;
        margin-top: 0px;
        margin-bottom: 0px;
    }

    .edit-button:hover {
        transform: scale(1.2);
        color: #EEE;
    }
</style>