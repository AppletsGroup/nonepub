import * as uuid from "uuid";

export function createUniqueId(): string {
  return uuid.v4();
}

export class EventEmitter<K> {
  listeners = new Map<K, Set<any>>();

  emit(name: K, payload: any) {
    const set = this.listeners.get(name) ?? new Set();
    set.forEach((fn) => {
      fn(payload);
    });
  }

  on(name: K, fn: any) {
    const set = this.listeners.get(name) ?? new Set();
    set.add(fn);
    this.listeners.set(name, set);

    return () => {
      const set = this.listeners.get(name) ?? new Set();
      set.delete(fn);
    };
  }

  off(name: K, fn: any) {
    const set = this.listeners.get(name) ?? new Set();
    set.delete(fn);
  }
}
