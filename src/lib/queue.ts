export class Queue<T> {
    _store: T[] = [];

    peek(): T | undefined {
      if (this._store.length > 0) {
        return this._store[0]
      } else {
        return undefined
      }
    }

    isEmpty(): boolean {
        return this._store.length == 0
    }

    push(val: T): void {
      this._store.push(val)
    }

    pop(): T | undefined {
      return this._store.shift()
    }

    length(): number {
      return this._store.length
    }

    pushAll(vals: T[]): void {
        vals.forEach((elem) => {
            this._store.push(elem)
        })
    }
  }