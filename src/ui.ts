import type { Task, Status } from "./types";

export function formatDate(iso: string): string {
    const d = new Date(iso);

    return d.toLocaleString(undefined, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

export function createTaskElement(task: Task): HTMLElement {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'listitem');
    card.draggable = true;
    card.dataset.id = task.id;

    const delBtn = document.createElement('button');
    delBtn.className = 'card-delete';
    delBtn.type = 'button';
    delBtn.title = 'Delete task',
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.textContent = 'x';

    const titleEl = document.createElement('div');
    titleEl.className = 'card-title';
    titleEl.textContent = task.title;

    const priorityEl = document.createElement('select');
    priorityEl.className = 'card-priority';
    ['Normal', 'Urgent'].forEach(level => {
        const option = document.createElement('option');
        option.value = level.toLowerCase();
        option.textContent = level;
        if (task.priority.toLowerCase() === level.toLowerCase()) option.selected = true;
        priorityEl.appendChild(option);
    });

    const metaEl = document.createElement('div');
    metaEl.className = 'card-meta';
    metaEl.textContent = `Created: ${formatDate(task.createdAt)}`;

    card.append(delBtn, titleEl, priorityEl, metaEl);

    if (task.finishedAt) {
    const metaFin = document.createElement('div');
    metaFin.className = 'card-meta card-completed';
    metaFin.textContent = `Completed: ${formatDate(task.finishedAt)}`;
    card.appendChild(metaFin);
    }

    return card;
}

export function bindDragAndDrop(
    columns: Record<Status, HTMLElement>,
    onMove: (taskId: string, to: Status) => void
): void {
    (Object.keys(columns) as Status[]).forEach((status) => {
        const col = columns[status];
        
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('drag-over');
        });

        col.addEventListener('dragleave', () => {
            col.classList.remove('drag-over');
        });

        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            const id = e.dataTransfer?.getData('text/plain');
            if (id) onMove(id, status);
        });
    });

    document.addEventListener('dragstart', (e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;

        const card = target.closest('.card') as HTMLElement | null;
        if (card && card.dataset.id) {
            e.dataTransfer?.setData('text/plain', card.dataset.id);

            card.style.opacity = '0.6';
        }
    });

    document.addEventListener('dragend', (e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const card = target.closest('.card') as HTMLElement | null;
        if (card) {
            card.style.opacity = '';
        }
    });
}

export function renderBoard(tasks: Task[], columns: Record<Status, HTMLElement>): void {

    (Object.keys(columns) as Status[]).forEach((status) => {
        columns[status].innerHTML = '';
    });

    tasks.forEach((task) => {
        const el = createTaskElement(task);
        columns[task.status].appendChild(el);
    });
}