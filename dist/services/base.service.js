"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const storage_1 = require("../utils/storage");
class BaseService {
    constructor(key) {
        this.key = key;
    }
    getAll() {
        return storage_1.Storage.get(this.key);
    }
    findById(id) {
        return this.getAll().find(x => x.id === id);
    }
    add(data) {
        const item = Object.assign({ id: storage_1.Storage.getNextId(this.key) }, data);
        storage_1.Storage.add(this.key, item);
        return item;
    }
    update(id, changes) {
        const items = this.getAll();
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1)
            throw new Error('Not found');
        const updated = Object.assign(Object.assign({}, items[idx]), changes);
        items[idx] = updated;
        storage_1.Storage.set(this.key, items);
        return updated;
    }
    delete(id) {
        const items = this.getAll().filter(i => i.id !== id);
        storage_1.Storage.set(this.key, items);
    }
    setAll(items) {
        storage_1.Storage.set(this.key, items);
    }
}
exports.BaseService = BaseService;
