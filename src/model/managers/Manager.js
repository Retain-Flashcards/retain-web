export default class Manager {
    constructor() {
        this.cache = {}
    }

    hasItem(identifier) {
        return this.cache.hasOwnProperty(identifier)
    }

    mergeIntoCache(identifier, item) {
        if (this.hasItem(identifier)) this.updateItem(this.cache[identifier], item)
        else this.cache[identifier] = item
    }

    updateItem(oldItem, newItem) {
        
    }

    async getItem(identifier) {
        if (this.hasItem(identifier)) return this.cache[identifier]
        else return await this.loadItem(identifier)
    }

    async loadItem(identifier) {
        
    }
}