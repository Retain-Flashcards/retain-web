<template>
    <el-timeline>
        <el-timeline-item type='primary' v-for='action in actionHistory' :timestamp='new Date(action.performed_at).toLocaleString()'>
            {{ action.action.name }}
        </el-timeline-item>
    </el-timeline>
</template>

<script>
import useActionManager from '../model/managers/ActionManager'

const actionManager = useActionManager()

export default {
    mounted() {
        this.loadActionHistory()
    },  
    data() {
        return {
            actionHistory: []
        }
    },
    methods: {
        loadActionHistory() {
            console.log('test')
            actionManager.loadActionHistoryForInvasion(this.$route.params.invasionId).then(data => {
                console.log(data)
                this.actionHistory = data
            }).catch(console.error)
        }
    }
}

</script>