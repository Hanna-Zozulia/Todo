import { formatDate, createTaskElement, renderBoard, bindDragAndDrop } from '../src/ui';
import { Task, Status } from '../src/types';

// A simple mock for the DataTransfer object, as it's not fully implemented in JSDOM
class DataTransferMock {
    private data: Record<string, string> = {};
    setData(format: string, data: string) {
        this.data[format] = data;
    }
    getData(format: string): string {
        return this.data[format];
    }
}

describe('ui.ts', () => {

    describe('formatDate', () => {
        it('should format an ISO string into a readable date and time', () => {
            const isoString = '2023-10-27T10:00:00.000Z';
            // Note: The output of toLocaleString can vary based on the test runner's environment/locale.
            // This test checks for the presence of key components.
            const formatted = formatDate(isoString);
            
            const date = new Date(isoString);
            // We check for parts of the date to avoid strict dependency on a specific locale format
            expect(formatted).toContain(date.getFullYear().toString());
            // Month is 0-indexed in JS Date, so +1
            expect(formatted).toContain((date.getMonth() + 1).toString().padStart(2, '0'));
            expect(formatted).toContain(date.getDate().toString().padStart(2, '0'));
        });
    });

    describe('createTaskElement', () => {
        const baseTask: Task = {
            id: 'task-123',
            title: 'Test the UI',
            priority: 'urgent',
            status: 'wip',
            createdAt: new Date().toISOString(),
        };

        it('should create a card element with correct attributes', () => {
            const card = createTaskElement(baseTask);
            expect(card).toBeInstanceOf(HTMLElement);
            expect(card.tagName).toBe('ARTICLE');
            expect(card.className).toBe('card');
            expect(card.draggable).toBe(true);
            expect(card.dataset.id).toBe(baseTask.id);
        });

        it('should include a title element with the task title', () => {
            const card = createTaskElement(baseTask);
            const titleEl = card.querySelector('.card-title');
            expect(titleEl).not.toBeNull();
            expect(titleEl!.textContent).toBe(baseTask.title);
        });
        
        it('should include a delete button', () => {
            const card = createTaskElement(baseTask);
            const delBtn = card.querySelector('.card-delete');
            expect(delBtn).not.toBeNull();
            expect(delBtn!.tagName).toBe('BUTTON');
        });

        it('should include a priority select with the correct value selected', () => {
            const card = createTaskElement(baseTask);
            const priorityEl = card.querySelector('.card-priority') as HTMLSelectElement;
            expect(priorityEl).not.toBeNull();
            expect(priorityEl.tagName).toBe('SELECT');
            expect(priorityEl.value).toBe(baseTask.priority);
        });
        
        it('should include meta info for creation date', () => {
            const card = createTaskElement(baseTask);
            const metaEl = card.querySelector('.card-meta');
            expect(metaEl).not.toBeNull();
            expect(metaEl!.textContent).toContain('Created:');
        });

        it('should NOT include completed meta info if finishedAt is not set', () => {
            const card = createTaskElement(baseTask);
            const completedEl = card.querySelector('.card-completed');
            expect(completedEl).toBeNull();
        });

        it('should include completed meta info if finishedAt is set', () => {
            const finishedTask: Task = {
                ...baseTask,
                finishedAt: new Date(Date.now() + 5000).toISOString(),
            };
            const card = createTaskElement(finishedTask);
            const completedEl = card.querySelector('.card-completed');
            expect(completedEl).not.toBeNull();
            expect(completedEl!.textContent).toContain('Completed:');
        });
    });

    describe('renderBoard', () => {
        let columns: Record<Status, HTMLElement>;

        beforeEach(() => {
            // Set up a mock DOM structure for the columns
            document.body.innerHTML = `
                <div id="todo-col"></div>
                <div id="wip-col"></div>
                <div id="test-col"></div>
                <div id="done-col"></div>
            `;
            columns = {
                todo: document.getElementById('todo-col')!,
                wip: document.getElementById('wip-col')!,
                test: document.getElementById('test-col')!,
                done: document.getElementById('done-col')!,
            };
        });
        
        const tasks: Task[] = [
            { id: '1', title: 'Task A', status: 'todo', priority: 'normal', createdAt: new Date().toISOString() },
            { id: '2', title: 'Task B', status: 'wip', priority: 'urgent', createdAt: new Date().toISOString() },
            { id: '3', title: 'Task C', status: 'todo', priority: 'normal', createdAt: new Date().toISOString() },
            { id: '4', title: 'Task D', status: 'done', priority: 'normal', createdAt: new Date().toISOString(), finishedAt: new Date().toISOString() },
        ];

        it('should clear all columns before rendering', () => {
            // Add some dummy content to check if it gets cleared
            columns.todo.innerHTML = '<div>Dummy</div>';
            columns.wip.innerHTML = '<span>Dummy</span>';
            
            renderBoard(tasks, columns);
            
            expect(columns.todo.innerHTML).not.toContain('Dummy');
            expect(columns.wip.innerHTML).not.toContain('Dummy');
        });

        it('should render tasks into their corresponding columns', () => {
            renderBoard(tasks, columns);

            // Check number of task cards in each column
            expect(columns.todo.children.length).toBe(2);
            expect(columns.wip.children.length).toBe(1);
            expect(columns.test.children.length).toBe(0);
            expect(columns.done.children.length).toBe(1);
        });

        it('should render correct task IDs in the elements', () => {
            renderBoard(tasks, columns);
            
            const todoCard1 = columns.todo.querySelector('[data-id="1"]');
            const todoCard2 = columns.todo.querySelector('[data-id="3"]');
            const wipCard = columns.wip.querySelector('[data-id="2"]');
            const doneCard = columns.done.querySelector('[data-id="4"]');

            expect(todoCard1).not.toBeNull();
            expect(todoCard2).not.toBeNull();
            expect(wipCard).not.toBeNull();
            expect(doneCard).not.toBeNull();
        });
        
        it('should handle an empty list of tasks', () => {
            renderBoard([], columns);
            expect(columns.todo.children.length).toBe(0);
            expect(columns.wip.children.length).toBe(0);
            expect(columns.test.children.length).toBe(0);
            expect(columns.done.children.length).toBe(0);
        });
    });

    describe('bindDragAndDrop', () => {
        let columns: Record<Status, HTMLElement>;
        let onMove: jest.Mock;
    
        beforeEach(() => {
            // Set up a mock DOM structure
            document.body.innerHTML = `
                <div id="todo-col">
                    <article class="card" data-id="task-1" draggable="true"></article>
                </div>
                <div id="wip-col"></div>
                <div id="test-col"></div>
                <div id="done-col"></div>
            `;
            columns = {
                todo: document.getElementById('todo-col')!,
                wip: document.getElementById('wip-col')!,
                test: document.getElementById('test-col')!,
                done: document.getElementById('done-col')!,
            };
            onMove = jest.fn();
            bindDragAndDrop(columns, onMove);
        });
    
        it('should add "drag-over" class on dragover', () => {
            const wipColumn = columns.wip;
            const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
            
            wipColumn.dispatchEvent(dragOverEvent);
            
            expect(wipColumn.classList.contains('drag-over')).toBe(true);
        });
    
        it('should remove "drag-over" class on dragleave', () => {
            const wipColumn = columns.wip;
            wipColumn.classList.add('drag-over');
    
            const dragLeaveEvent = new Event('dragleave', { bubbles: true });
            wipColumn.dispatchEvent(dragLeaveEvent);
    
            expect(wipColumn.classList.contains('drag-over')).toBe(false);
        });
    
        it('should call onMove with the correct ID and status on drop', () => {
            const wipColumn = columns.wip;
            const dataTransfer = new DataTransferMock();
            dataTransfer.setData('text/plain', 'task-1');
    
            // We create a generic event and attach the dataTransfer object.
            const dropEvent = new Event('drop', { bubbles: true, cancelable: true }) as any;
            dropEvent.dataTransfer = dataTransfer;
            
            wipColumn.dispatchEvent(dropEvent);
    
            expect(onMove).toHaveBeenCalledTimes(1);
            expect(onMove).toHaveBeenCalledWith('task-1', 'wip');
        });
        
        it('should set dataTransfer and opacity on dragstart', () => {
            const card = document.querySelector('[data-id="task-1"]') as HTMLElement;
            const dataTransfer = new DataTransferMock();
    
            const dragStartEvent = new Event('dragstart', { bubbles: true }) as any;
            dragStartEvent.dataTransfer = dataTransfer;
            
            card.dispatchEvent(dragStartEvent);
    
            expect(dataTransfer.getData('text/plain')).toBe('task-1');
            expect(card.style.opacity).toBe('0.6');
        });
    
        it('should reset opacity on dragend', () => {
            const card = document.querySelector('[data-id="task-1"]') as HTMLElement;
            card.style.opacity = '0.6';
    
            const dragEndEvent = new Event('dragend', { bubbles: true });
            card.dispatchEvent(dragEndEvent);
    
            expect(card.style.opacity).toBe('');
        });
    });
});
