"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
exports.Storage = {
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
        const list = exports.Storage.get(key);
        list.push(item);
        exports.Storage.set(key, list);
    }
};
