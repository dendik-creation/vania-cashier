export const saveToLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
};
export const getFromLocalStorage = (key: string) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
};
export const removeFromLocalStorage = (key: string) => {
    localStorage.removeItem(key);
};
export const clearLocalStorage = () => {
    localStorage.clear();
};
