<template>
    <div class="daily-activity-chart">
        <LoadableProvider :loadable="loadable">
            <template #notStarted>
                <div class="chart-placeholder"></div>
            </template>
            <template #loading>
                <div class="chart-placeholder">
                    <span class="loading-text">Loading activity...</span>
                </div>
            </template>
            <template #error>
                <div class="chart-placeholder error">
                    <span class="error-text">Failed to load activity</span>
                </div>
            </template>
            <template #default="{ data }">
                <div class="chart-container">
                    <div 
                        v-for="bucket in data" 
                        :key="bucket.date" 
                        class="chart-column"
                    >
                        <div class="bar-container">
                            <div class="count-tooltip">
                                {{ bucket.newSeen + bucket.reviewSeen }}
                            </div>
                            <!-- Stacked bars: new on top, review on bottom -->
                            <div class="stacked-bar" :style="{ height: getBarHeight(bucket, data) }">
                                <div 
                                    class="bar-segment bar-new" 
                                    :style="{ flex: bucket.newSeen }"
                                    v-if="bucket.newSeen > 0"
                                ></div>
                                <div 
                                    class="bar-segment bar-review" 
                                    :style="{ flex: bucket.reviewSeen }"
                                    v-if="bucket.reviewSeen > 0"
                                ></div>
                            </div>
                        </div>
                        <div class="day-label" :class="{ 'is-today': bucket.label === 'Today' }">
                            <div class="weekday">{{ bucket.label === 'Today' ? 'Today' : bucket.weekday }}</div>
                            <div class="month-day">{{ bucket.monthDay }}</div>
                        </div>
                    </div>
                </div>
                <!-- Legend -->
                <div class="chart-legend">
                    <span class="legend-item">
                        <span class="legend-dot legend-dot--new"></span> New
                    </span>
                    <span class="legend-item">
                        <span class="legend-dot legend-dot--review"></span> Review
                    </span>
                </div>
            </template>
        </LoadableProvider>
    </div>
</template>

<script setup>
import LoadableProvider from './basic/providers/LoadableProvider.vue'

const props = defineProps({
    loadable: {
        type: Object,
        required: true
    }
})

const getBarHeight = (bucket, data) => {
    if (!data || data.length === 0) return '0%'
    const total = bucket.newSeen + bucket.reviewSeen
    const maxTotal = Math.max(...data.map(d => d.newSeen + d.reviewSeen))
    if (maxTotal === 0 || total === 0) return '0%'
    
    const percentage = Math.max((total / maxTotal) * 100, 10)
    return `${percentage}%`
}
</script>

<style scoped>
.daily-activity-chart {
    width: 100%;
    margin-top: 0.5rem;
}

.chart-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 100px;
    padding: 0 1rem;
}

.chart-column {
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
    padding-bottom: 8px;
    border-bottom: 2px solid var(--el-border-color-lighter);
}

.stacked-bar {
    width: 24px;
    display: flex;
    flex-direction: column;
    border-radius: 4px 4px 0 0;
    overflow: hidden;
    transition: height 0.3s ease;
    min-height: 0;
}

.bar-segment {
    min-height: 3px;
}

.bar-new {
    background-color: var(--deck-primary, var(--el-color-primary, #409EFF));
}

.bar-review {
    background-color: var(--deck-primary, var(--el-color-primary-light-5, #79bbff));
    opacity: 0.5;
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

.chart-legend {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 12px;
    font-size: 0.75rem;
    color: var(--el-text-color-secondary);
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.legend-dot--new {
    background-color: var(--deck-primary, var(--el-color-primary, #409EFF));
}

.legend-dot--review {
    background-color: var(--deck-primary, var(--el-color-primary-light-5, #79bbff));
    opacity: 0.5;
}

.chart-placeholder {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    color: var(--el-text-color-secondary);
    font-size: 0.85rem;
}

.chart-placeholder.error {
    color: var(--el-color-danger);
    background-color: var(--el-color-danger-light-9);
}

@media (max-width: 600px) {
    .stacked-bar {
        width: 16px;
    }
    
    .chart-container {
        padding: 0 0.5rem;
    }
}
</style>
