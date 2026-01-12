const STORAGE_KEY = 'kanban_tasks_v1';
export function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed.filter((t) => t && typeof t === 'object' &&
            typeof t.id === 'string' &&
            typeof t.title === 'string' &&
            typeof t.createdAt === 'string' &&
            ['todo', 'wip', 'test', 'done'].includes(t.status));
    }
    catch (_a) {
        return [];
    }
}
export function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
export function generateId() {
    const rnd = Math.random().toString(36).slice(2, 8);
    return `${Date.now().toString(36)}_${rnd}`;
}
//# sourceMappingURL=storage.js.map