class Storage {
    static saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    static getData(key) {
        const savedData = localStorage.getItem(key);
        return savedData ? JSON.parse(savedData) : [];
    }
}
export default Storage;
