<template>
    <div class='card' :style="{ backgroundImage: imgUrl ? `url('` + imgUrl + `')`:'none' }">
        <div :class='`card-container ${imgUrl ? "card-overlay": ""}`'>
            <div class='card-header' >
                <h3>{{ title }}</h3>
            </div>
    
            <div class='card-content'>
                <div class='new count-item'>
                    <div class='flex-spacer'></div>
                    <h1>{{ newCount }}</h1>
                    <p>New</p>
                    <div class='flex-spacer'></div>
                </div>
                <div class='review count-item'>
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

export default {
    props: ['title', 'imgUrl', 'reviewCount', 'newCount']
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

    .card-container {
        display: flex;
        flex-direction: column;
    }

    .card-header {
        padding-top: 20px;
        padding-left: 20px;
        padding-right: 20px;
    }

    h3 {
        margin-top: 50px;
        margin-bottom: 10px;
        color: white;
        font-size: 23px;
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
</style>