export const Storage = {
    get(key) {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    },
    set(key, items) {
        localStorage.setItem(key, JSON.stringify(items));
    },
    getNextId(key) {
        const metaKey = `${key}.__nextId`;
        const raw = localStorage.getItem(metaKey);
        let next = raw ? Number(raw) : 1;
        localStorage.setItem(metaKey, String(next + 1));
        return next;
    },
    add(key, item) {
        const list = Storage.get(key);
        list.push(item);
        Storage.set(key, list);
    }
};
