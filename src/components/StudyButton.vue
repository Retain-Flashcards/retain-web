<template>
<div class='study-container'>
    <el-result v-if='reviewCount == 0 && newCount == 0' icon="success" title="Done for the Day!" subTitle="No Reviews Due" style='flex: 2;'>
        <template slot="extra">
            <brand-button type="primary">Back</brand-button>
        </template>
    </el-result>
    <div v-else class='due-container' style='flex: 2;'>
        <div style='display: flex; flex-direction: row;'>
            <div class='stats' style='flex: 2;'>
                <div class='stats-container'>
                    <div class='flex-spacer'></div>
                    <div class='stats-item' style='color: var(--el-color-primary);'>
                        <h2 class='new-text'>{{ newCount }}</h2>
                        <p class='new-text'>New</p>
                    </div>
                    <div class='stats-item' style='color: var(--el-color-primary-light-4);'>
                        <h2 class='review-text'>{{ reviewCount }}</h2>
                        <p class='review-text'>Review</p>
                    </div>
                    <div class='flex-spacer'></div>
                </div>
                <div class='stats-overlay' @click='beginStudy'>
                    <button class='study-button'>Study Now</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import BrandButton from './basic/BrandButton.vue'

const emit = defineEmits(['beginStudy', 'back'])
const props = defineProps(['newCount', 'reviewCount'])

function beginStudy() {
    emit('beginStudy')
}

function back() {
    emit('back')
}

</script>

<style scoped>
.stats {
    position: relative;
    border: #EEE solid 3px;
    margin-bottom: 50px;
    border-radius: 20px;
    overflow: hidden;
} 

.stats-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.study-container {
    display: flex;
    flex-direction: row;
}

.stats-overlay {
    position: absolute;
    display: flex;
    left: 0px;
    top: 0px;
    background: var(--el-color-primary-overlay);
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: 0.5s;
    transform: scale(1.1);
}

.stats-overlay:hover {
    opacity: 0.8;
    cursor: pointer;
    transform: scale(1);
}

.stats-item {
    text-align: center;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 20px;
    margin-right: 20px;
    flex: 0.3;
}

.study-button {
    color: white;
    border: white solid 2px;
    border-radius: 5px;
    padding: 10px;
    background: none;
    transition: 0.2s;
    font-weight: bold;
    font-size: 13px;
}

.study-button:hover {
    /*transform: scale(1.05);*/
    cursor: pointer;
}

.stats-item h2 {
    font-size: 40px;
    margin: 0px;
    margin-bottom: 10px;
}
</style>
