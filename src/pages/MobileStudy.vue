<template>
    <div>
        <v-md-preview class='preview' :text="flipped ? card.backContent:card.frontContent" v-if='card' height='400px'></v-md-preview>
        <div v-if='card && flipped && card.extraContent.length > 0' style='height: 2px; width: 100%; background: #EEE;'></div>
        <v-md-preview class='preview' :text="card.extraContent" v-if='card && flipped && card.extraContent.length > 0' height='400px'></v-md-preview>
    </div>
</template>

<script>

export default {
    data() {
        return {
            card: {},
            flipped: false
        }
    },
    mounted() {
        window.flipCard = this.flipCard
        window.setCard = this.setCard

        StudyChannel.postMessage('ready')
    },
    methods: {
        flipCard() {
            this.flipped = true
        },
        setCard(data) {
            this.card = data
        }
    }
}

</script>