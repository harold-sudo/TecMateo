import { Storage } from "../utils/storage.js";

export class BaseService<T extends { id: number }> {
  protected key: string;

  constructor(key: string){
    this.key = key;
  }

  getAll(): T[] {
    return Storage.get<T>(this.key);
  }

  findById(id: number): T | undefined {
    return this.getAll().find(x => x.id === id);
  }

  add(data: Omit<T,'id'>): T {
    const item = { id: Storage.getNextId(this.key), ...(data as object) } as T;
    Storage.add<T>(this.key, item);
    return item;
  }

  update(id: number, changes: Partial<Omit<T,'id'>>): T {
    const items = this.getAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Not found');
    const updated = { ...items[idx], ...(changes as object) } as T;
    items[idx] = updated;
    Storage.set(this.key, items);
    return updated;
  }

  delete(id: number){
    const items = this.getAll().filter(i => i.id !== id);
    Storage.set(this.key, items);
  }

  setAll(items: T[]){
    Storage.set(this.key, items);
  }
}
