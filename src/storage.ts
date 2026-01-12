import type { Task } from './types';

const STORAGE_KEY = 'kanban_tasks_v1';

export function loadTasks(): Task[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        
        return parsed.filter((t) =>
        t && typeof t === 'object' &&
        typeof (t as any).id === 'string' &&
        typeof (t as any).title === 'string' &&
        typeof (t as any).createdAt === 'string' &&
        (['todo', 'wip', 'test', 'done'] as const).includes((t as any).status)
        ) as Task[];
    } catch {
        return [];
    }
}

export function saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function generateId(): string {
    const rnd = Math.random().toString(36).slice(2, 8);
    return `${Date.now().toString(36)}_${rnd}`;
}