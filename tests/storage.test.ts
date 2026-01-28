import { loadTasks, saveTasks, generateId } from '../src/storage';
import { Task } from '../src/types'; // Assuming types.ts defines Task interface

// Mock localStorage before each test to ensure a clean state
const localStorageMock = (function () {
    let store: { [key: string]: string } = {};
    return {
        getItem(key: string) {
            return store[key] || null;
        },
        setItem(key: string, value: string) {
            store[key] = value.toString();
        },
        removeItem(key: string) {
            delete store[key];
        },
        clear() {
            store = {};
        }
    };
})();

// Replace the global localStorage with our mock
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('storage.ts', () => {
    beforeEach(() => {
        // Clear localStorage mock before each test to prevent test interference
        localStorage.clear();
    });

    describe('generateId', () => {
        // Test that generateId produces a string
        it('should generate a unique ID', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(typeof id1).toBe('string');
            expect(id1).not.toBe(id2); // Ensure IDs are unique
            expect(id1.length).toBeGreaterThan(0);
        });

        // Test the format of the generated ID
        it('should generate IDs with expected format (timestamp_random)', () => {
            const id = generateId();
            // Basic check for format, e.g., contains '_' and consists of alphanumeric characters
            expect(id).toMatch(/^[a-z0-9]+_[a-z0-9]+$/);
        });
    });

    describe('saveTasks', () => {
        // Test saving a list of tasks
        it('should save tasks to localStorage', () => {
            const tasks: Task[] = [
                { id: '1', title: 'Task 1', status: 'todo', priority: 'normal', createdAt: new Date().toISOString() },
                { id: '2', title: 'Task 2', status: 'wip', priority: 'normal', createdAt: new Date().toISOString() }
            ];
            saveTasks(tasks);
            const saved = localStorage.getItem('kanban_tasks_v1');
            expect(saved).not.toBeNull();
            // Parse the saved string and compare with original tasks
            expect(JSON.parse(saved!)).toEqual(tasks);
        });

        // Test saving an empty array of tasks
        it('should save an empty array of tasks', () => {
            const tasks: Task[] = [];
            saveTasks(tasks);
            const saved = localStorage.getItem('kanban_tasks_v1');
            expect(saved).not.toBeNull();
            expect(JSON.parse(saved!)).toEqual([]);
        });
    });

    describe('loadTasks', () => {
        // Test loading a valid list of tasks
        it('should load tasks from localStorage', () => {
            const tasks: Task[] = [
                { id: 'a', title: 'Loaded Task A', status: 'todo', priority: 'normal', createdAt: new Date().toISOString() },
                { id: 'b', title: 'Loaded Task B', status: 'done', priority: 'normal', createdAt: new Date().toISOString() }
            ];
            localStorage.setItem('kanban_tasks_v1', JSON.stringify(tasks));
            const loaded = loadTasks();
            expect(loaded).toEqual(tasks);
        });

        // Test loading when localStorage is empty
        it('should return an empty array if localStorage is empty', () => {
            const loaded = loadTasks();
            expect(loaded).toEqual([]);
        });

        // Test loading when localStorage contains invalid JSON
        it('should return an empty array if localStorage contains invalid JSON', () => {
            localStorage.setItem('kanban_tasks_v1', 'invalid json');
            const loaded = loadTasks();
            expect(loaded).toEqual([]);
        });

        // Test loading when localStorage contains valid JSON but not an array
        it('should return an empty array if localStorage contains non-array JSON', () => {
            localStorage.setItem('kanban_tasks_v1', '{"not": "an array"}');
            const loaded = loadTasks();
            expect(loaded).toEqual([]);
        });

        // Test filtering out malformed task objects
        it('should filter out invalid task objects from localStorage', () => {
            const createdAt1 = new Date().toISOString();
            const createdAt2 = new Date(Date.now() + 1000).toISOString(); // Slightly different timestamp

            const malformedData = [
                { id: 'valid1', title: 'Valid Task', status: 'todo', priority: 'normal', createdAt: createdAt1 },
                { id: 'invalid1', title: 'Missing Status' }, // Invalid: missing status
                { id: 'invalid2', status: 'wip', createdAt: createdAt2 }, // Invalid: missing title
                { id: 'valid2', title: 'Another Valid Task', status: 'done', priority: 'urgent', createdAt: createdAt2 },
                null, // Invalid: null entry
                'just a string' // Invalid: string entry
            ];
            localStorage.setItem('kanban_tasks_v1', JSON.stringify(malformedData));

            const expectedValidTasks: Task[] = [
                { id: 'valid1', title: 'Valid Task', status: 'todo', priority: 'normal', createdAt: createdAt1 },
                { id: 'valid2', title: 'Another Valid Task', status: 'done', priority: 'urgent', createdAt: createdAt2 }
            ];
            const loaded = loadTasks();
            expect(loaded).toEqual(expectedValidTasks);
        });

        // Test handling of invalid status values in tasks
        it('should handle invalid status values', () => {
            const createdAt = new Date().toISOString();
            const dataWithInvalidStatus = [
                { id: '1', title: 'Task 1', status: 'todo', priority: 'normal', createdAt: createdAt },
                { id: '2', title: 'Task 2', status: 'invalid_status', priority: 'normal', createdAt: new Date().toISOString() } // Invalid status
            ];
            localStorage.setItem('kanban_tasks_v1', JSON.stringify(dataWithInvalidStatus));
            const expectedValidTasks: Task[] = [
                { id: '1', title: 'Task 1', status: 'todo', priority: 'normal', createdAt: createdAt }
            ];
            const loaded = loadTasks();
            expect(loaded).toEqual(expectedValidTasks);
        });
    });
});
