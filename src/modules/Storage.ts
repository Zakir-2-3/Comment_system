class Storage {
  static saveData<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static getData<T>(key: string): T | [] {
    const savedData = localStorage.getItem(key);
    return savedData ? (JSON.parse(savedData) as T) : [];
  }
}

export default Storage;
