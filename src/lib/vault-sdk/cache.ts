export class SecretCache {
  private store = new Map<string, string>();

  get(key: string): string | undefined {
    return this.store.get(key);
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  invalidate(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  get size(): number {
    return this.store.size;
  }
}

export function cacheKey(environmentId: string, name: string): string {
  return `${environmentId}:${name}`;
}
