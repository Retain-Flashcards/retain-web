<template>
    <div class='message'>
        <div class='message-label'>
            <div v-if='props.side === "right"' style='flex: 1;'></div>
            <div>{{ props.label }}</div>
            <div v-if='props.side === "left"' style='flex: 1;'></div>
        </div>
        <div class='message-container'>
            <div v-if='props.side === "right"' style='flex: 1;'></div>
            <div class='message-bubble' v-if='props.type === "normal"'>
                <slot></slot>
            </div>
            <div class='cards-container' v-if='props.type === "cards"'>
                <slot></slot>
            </div>
            <div v-if='props.side === "left"' style='flex: 1;'></div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps(['side', 'label', 'type'])
</script>

<style scoped>
.message {
    display: flex;
    flex-direction: column;
    margin: 10px;
}

.message-container {
    display: flex;
}

.message-bubble {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 10px;
    max-width: 80%;
}

.message-label {
    display: flex;
    flex-direction: row;
    height: 20px;
    color: #666;
    font-size: 12px;
    margin-top: 5px;
    margin-left: 5px;
    margin-right: 5px;
}
</style>