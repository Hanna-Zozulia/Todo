export type Status = 'todo' | 'wip' | 'test' | 'done';

export interface Task {
    id: string;
    title: string;
    priority: 'urgent' | 'normal';
    createdAt: string;
    status: Status;
    finishedAt?: string;   
}
