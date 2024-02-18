import EventEmitter from 'events';

// Define the LoadableState enum
export const LoadableState = {
    NOT_STARTED: 'notStarted',
    LOADING: 'loading',
    ERROR: 'error',
    DATA: 'data',
    DONE: 'done' // Optional, for paginated loads
  };
  
  // Define the LoadableUpdate class
  export class LoadableUpdate {
    constructor(state, error = null, data = null) {
      this.state = state;
      this.error = error;
      this.data = data;
    }
  }
  
  // Define the Loadable class
  export default class Loadable {
    constructor() {
      this._streamController = new EventEmitter();
    }
  
    _currentFuture = null;
    _value = null;
  
    get value() {
      return this._value;
    }
  
    set value(newValue) {
      this._value = newValue;
      if (newValue !== null) {
        this._streamController.emit('loadableUpdate', new LoadableUpdate(LoadableState.DATA, null, newValue));
      }
    }
  
    async reload() {
      if (this._currentFuture !== null) {
        await this.loadWithFuture(this._currentFuture);
      }
    }
  
    async loadWithFuture(future) {
      this._currentFuture = future;
  
      // Start loading
      this._streamController.emit('loadableUpdate', new LoadableUpdate(LoadableState.LOADING));
  
      try {
        this._value = await future();
  
        // Update the stream with data
        if (this._value !== null) {
            console.log('UPDATING')
          this._streamController.emit('loadableUpdate', new LoadableUpdate(LoadableState.DATA, null, this._value));
        }
      } catch (error) {
        this._streamController.emit('loadableUpdate', new LoadableUpdate(LoadableState.ERROR, error.toString()));
        throw error;
      }
  
      return this._value;
    }
  
    async silentlyLoadWithFuture(future) {
      this._currentFuture = future;
  
      try {
        this._value = await future();
  
        // Update the stream with data
        if (this._value !== null) {
          this._streamController.emit('loadableUpdate', new LoadableUpdate(LoadableState.DATA, null, this._value));
        }
      } catch (error) {
        this._streamController.emit('loadableUpdate', new LoadableUpdate(LoadableState.ERROR, error.toString()));
        throw error;
      }
  
      return this._value;
    }
  
    get stream() {
      return this._streamController;
    }
  
    dispose() {
      this._streamController.close();
    }
  
    listenToStream(onData) {
        console.log('onData', onData)
      const subscription = this._streamController.on('loadableUpdate', onData)
      if (this._value) this._streamController.emit('loadableUpdate', new LoadableUpdate(LoadableState.DATA, null, this._value))
        return subscription
    }
  }