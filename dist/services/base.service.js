import { Storage } from "../utils/storage.js";
export class BaseService {
    constructor(key) {
        this.key = key;
    }
    getAll() {
        return Storage.get(this.key);
    }
    findById(id) {
        return this.getAll().find(x => x.id === id);
    }
    add(data) {
        const item = Object.assign({ id: Storage.getNextId(this.key) }, data);
        Storage.add(this.key, item);
        return item;
    }
    update(id, changes) {
        const items = this.getAll();
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1)
            throw new Error('Not found');
        const updated = Object.assign(Object.assign({}, items[idx]), changes);
        items[idx] = updated;
        Storage.set(this.key, items);
        return updated;
    }
    delete(id) {
        const items = this.getAll().filter(i => i.id !== id);
        Storage.set(this.key, items);
    }
    setAll(items) {
        Storage.set(this.key, items);
    }
}
