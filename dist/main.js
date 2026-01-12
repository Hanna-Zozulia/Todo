import { loadTasks, saveTasks, generateId } from './storage.js';
import { renderBoard, bindDragAndDrop } from './ui.js';
const form = document.getElementById('new-task-form');
const titleInput = document.getElementById('task-title');
const priorityInput = document.getElementById('task-priority');
const colTodo = document.getElementById('col-todo');
const colWip = document.getElementById('col-wip');
const colTest = document.getElementById('col-test');
const colDone = document.getElementById('col-done');
const columns = {
    todo: colTodo,
    wip: colWip,
    test: colTest,
    done: colDone,
};
let tasks = loadTasks();
function sync() {
    renderBoard(tasks, columns);
    saveTasks(tasks);
}
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        if (!title)
            return;
        const priority = priorityInput.value;
        const newTask = {
            id: generateId(),
            title,
            priority,
            createdAt: new Date().toISOString(),
            status: 'todo',
        };
        tasks = [newTask, ...tasks];
        titleInput.value = '';
        sync();
    });
}
else {
    console.error('Форма не найдена в DOM');
}
function moveTask(taskId, to) {
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1)
        return;
    const updatedTask = { ...tasks[idx], status: to };
    if (to === 'done') {
        updatedTask.finishedAt = new Date().toISOString();
    }
    else {
        delete updatedTask.finishedAt;
    }
    tasks[idx] = updatedTask;
    sync();
    if (to === 'done') {
        const el = columns.done.querySelector(`[data-id="${taskId}"]`);
        if (el) {
            el.classList.add('flash-done');
            setTimeout(() => el.classList.remove('flash-done'), 1000);
        }
    }
}
bindDragAndDrop(columns, moveTask);
sync();
document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target)
        return;
    const delBtn = target.closest('.card-delete');
    if (!delBtn)
        return;
    e.preventDefault();
    e.stopPropagation();
    const card = delBtn.closest('.card');
    const id = card === null || card === void 0 ? void 0 : card.dataset.id;
    if (!id)
        return;
    tasks = tasks.filter((t) => t.id !== id);
    sync();
});
//# sourceMappingURL=main.js.map