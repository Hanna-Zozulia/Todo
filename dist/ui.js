export function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}
export function createTaskElement(task) {
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
        if (task.priority.toLowerCase() === level.toLowerCase())
            option.selected = true;
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
export function bindDragAndDrop(columns, onMove) {
    Object.keys(columns).forEach((status) => {
        const col = columns[status];
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('drag-over');
        });
        col.addEventListener('dragleave', () => {
            col.classList.remove('drag-over');
        });
        col.addEventListener('drop', (e) => {
            var _a;
            e.preventDefault();
            col.classList.remove('drag-over');
            const id = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
            if (id)
                onMove(id, status);
        });
    });
    document.addEventListener('dragstart', (e) => {
        var _a;
        const target = e.target;
        if (!target)
            return;
        const card = target.closest('.card');
        if (card && card.dataset.id) {
            (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData('text/plain', card.dataset.id);
            card.style.opacity = '0.6';
        }
    });
    document.addEventListener('dragend', (e) => {
        const target = e.target;
        if (!target)
            return;
        const card = target.closest('.card');
        if (card) {
            card.style.opacity = '';
        }
    });
}
export function renderBoard(tasks, columns) {
    Object.keys(columns).forEach((status) => {
        columns[status].innerHTML = '';
    });
    tasks.forEach((task) => {
        const el = createTaskElement(task);
        columns[task.status].appendChild(el);
    });
}
//# sourceMappingURL=ui.js.map