<template>
    <div class="due-reviews-graph">
        <LoadableProvider :loadable="loadable">
            <template #notStarted>
                <div class="graph-placeholder"></div>
            </template>
            <template #loading>
                <div class="graph-placeholder">
                    <span class="loading-text">Loading graph...</span>
                </div>
            </template>
            <template #error="{ error }">
                <div class="graph-placeholder error">
                    <span class="error-text">Failed to load graph</span>
                </div>
            </template>
            <template #default="{ data }">
                <div class="graph-container">
                    <div 
                        v-for="bucket in data" 
                        :key="bucket.date" 
                        class="graph-column"
                    >
                        <div class="bar-container">
                            <div 
                                class="count-tooltip" 
                            >
                                {{ bucket.count }}
                            </div>
                            <div 
                                class="bar" 
                                :class="{ 'is-future': bucket.isFuture }"
                                :style="{ height: getBarHeight(bucket.count, data) }"
                            ></div>
                        </div>
                        <div class="day-label" :class="{ 'is-today': bucket.label === 'Today' }">
                            <div class="weekday">{{ bucket.label === 'Today' ? 'Today' : bucket.weekday }}</div>
                            <div class="month-day">{{ bucket.monthDay }}</div>
                        </div>
                    </div>
                </div>
            </template>
        </LoadableProvider>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import LoadableProvider from './basic/providers/LoadableProvider.vue'

const props = defineProps({
    loadable: {
        type: Object,
        required: true
    }
})

const getBarHeight = (count, data) => {
    if (!data || data.length === 0) return '0%'
    const maxCount = Math.max(...data.map(d => d.count))
    if (maxCount === 0 || count === 0) return '0%'
    
    // Minimum height of 10% if count > 0 for visibility
    const percentage = Math.max((count / maxCount) * 100, 10)
    return `${percentage}%`
}
</script>

<style scoped>
.due-reviews-graph {
    width: 100%;
    margin-top: 1rem;
    margin-bottom: 2rem;
}

.graph-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 120px;
    padding: 0 1rem;
}

.graph-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    height: 100%;
}

.bar-container {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    position: relative;
    padding-bottom: 8px; /* space between bar and label */
    border-bottom: 2px solid var(--el-border-color-lighter);
}

.bar {
    width: 24px;
    background-color: var(--deck-primary, var(--el-color-primary, #409EFF));
    border-radius: 4px 4px 0 0;
    transition: height 0.3s ease;
    min-height: 4px; /* Ensure a small tick even at 0% to show existence */
}

.bar.is-future {
    opacity: 0.3;
}

.count-tooltip {
    font-size: 0.75rem;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
    font-weight: 500;
}

.day-label {
    font-size: 0.75rem;
    color: var(--el-text-color-secondary);
    text-align: center;
    margin-top: 8px;
}

.day-label.is-today {
    font-weight: bold;
    color: var(--el-text-color-primary);
}

.month-day {
    font-size: 0.65rem;
    color: var(--el-text-color-placeholder);
    margin-top: 2px;
}

.graph-placeholder {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    color: var(--el-text-color-secondary);
    font-size: 0.85rem;
}

.graph-placeholder.error {
    color: var(--el-color-danger);
    background-color: var(--el-color-danger-light-9);
}

@media (max-width: 600px) {
    .bar {
        width: 16px;
    }
    
    .graph-container {
        padding: 0 0.5rem;
    }
}
</style>
