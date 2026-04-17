export const Storage = {
  get<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T[] : [];
  },
  set<T>(key: string, items: T[]) {
    localStorage.setItem(key, JSON.stringify(items));
  },
  getNextId(key: string): number {
    const metaKey = `${key}.__nextId`;
    const raw = localStorage.getItem(metaKey);
    let next = raw ? Number(raw) : 1;
    localStorage.setItem(metaKey, String(next + 1));
    return next;
  },
  add<T extends { id: number }>(key: string, item: T) {
    const list = Storage.get<T>(key);
    list.push(item);
    Storage.set(key, list);
  }
};