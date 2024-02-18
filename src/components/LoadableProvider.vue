<template>
    <div v-if="currentState === LoadableState.NOT_STARTED">
      <slot name="notStarted" :loadable="loadable" />
    </div>
    <div v-else-if="currentState === LoadableState.LOADING">
      <slot name="loading" :loadable="loadable" />
    </div>
    <div v-else-if="currentState === LoadableState.ERROR">
      <slot name="error" :error="errorMessage" />
    </div>
    <div v-else>
      <slot name="data" :data="loadable.value" />
    </div>
  </template>
  
  <script>
  import Loadable, { LoadableState } from '../model/loadable.js'; // Import the Loadable class
  
  export default {
    name: 'LoadableProvider',
    props: {
      loadable: {
        type: Loadable,
        required: true,
      },
    },
    data() {
      return {
        currentState: LoadableState.NOT_STARTED,
        errorMessage: '',
        LoadableState
      };
    },
    created() {
      this.loadable.listenToStream((update) => {
        console.log('LoadableProvider update:', update);
        this.currentState = update.state;
        if (update.state === LoadableState.ERROR) {
          this.errorMessage = update.error;
        }
      });
    },
  };
  </script>