
export class Registry<K, V> {
  data: { [key: string]: V }
  serialize: (entry: K) => string

  constructor(serialize: (key: K) => string) {
    this.serialize = serialize;
    this.data = {};
  }

  contains(key: K) {
    const serializedKey = this.serialize(key);
    return !!this.data[serializedKey];
  }

  add(key: K, value: V) {
    const serializedKey = this.serialize(key);
    this.data[serializedKey] = value;
  }

  get(key: K): V {
    const serializedKey = this.serialize(key);
    return this.data[serializedKey];
  }
}