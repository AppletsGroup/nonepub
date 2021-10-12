type EventMap = Record<string, any>
type EventKey<T extends EventMap> = string & keyof T
type EventReceiver<T> = (params: T) => void

export class EventEmitter<T extends EventMap> {
  listeners = new Map<string, Set<any>>()

  emit<K extends EventKey<T>>(name: K, payload: T[K]) {
    const set = this.listeners.get(name) ?? new Set()
    const ret: any[] = []
    set.forEach((fn) => {
      ret.push(fn(payload))
    })
    return ret
  }

  on<K extends EventKey<T>>(name: K, fn: EventReceiver<T[K]>) {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, new Set())
    }

    const set = this.listeners.get(name)!
    set.add(fn)

    return () => {
      const set = this.listeners.get(name)!
      set.delete(fn)
    }
  }
}
