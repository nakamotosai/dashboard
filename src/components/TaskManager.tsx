import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Task {
    id: string;
    text: string;
    column: 'todo' | 'done';
}

export const TaskManager = () => {
    // Tab State (Simplified to Todo and Done)
    const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');

    const [tasks, setTasks] = useState<Task[]>(() => {
        const saved = localStorage.getItem('dashboard_tasks');
        const initialTasks = saved ? JSON.parse(saved) : [
            { id: '1', text: 'Dashboard 布局微调', column: 'done' },
            { id: '3', text: 'Review Design', column: 'todo' }
        ];
        // Migration: ensure any old 'doing' tasks are converted to 'todo'
        return initialTasks.map((t: any) => t.column === 'doing' ? { ...t, column: 'todo' } : t);
    });

    const [newTaskText, setNewTaskText] = useState('');

    useEffect(() => {
        localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        const newTask: Task = {
            id: Date.now().toString(),
            text: newTaskText,
            column: 'todo'
        };
        setTasks([...tasks, newTask]);
        setNewTaskText('');
        setActiveTab('todo');
    };

    const moveTask = (taskId: string, targetCol: Task['column']) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, column: targetCol } : t));
    };

    const deleteTask = (taskId: string) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const visibleTasks = tasks.filter(t => t.column === activeTab);

    return (
        <div className="glass-panel rounded-3xl p-5 h-full flex flex-col relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-luxury-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className={twMerge(
                "absolute -left-12 -bottom-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-colors duration-500",
                activeTab === 'todo' ? "bg-yellow-500/20" : "bg-blue-500/10"
            )} />

            {/* Title */}
            <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="w-1 h-3 bg-yellow-500 rounded-full" />
                <h3 className="text-[10px] font-sans font-medium text-white/40 tracking-widest uppercase">
                    集成 Google Tasks 风格看板
                </h3>
            </div>
            {/* Input Form */}
            <form onSubmit={addTask} className="flex gap-2 mb-4 shrink-0">
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="New Task..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
                <button type="submit" className="bg-white/10 hover:bg-yellow-500/20 text-white hover:text-yellow-400 rounded-xl w-10 flex items-center justify-center transition-colors shadow-lg">
                    <Plus size={16} />
                </button>
            </form>

            {/* Tabs (Todo & Done only) */}
            <div className="flex bg-black/20 p-1 rounded-xl mb-4 shrink-0">
                {(['todo', 'done'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={twMerge(
                            "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300",
                            activeTab === tab
                                ? tab === 'todo'
                                    ? "bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                                    : "bg-white/10 text-white shadow-sm"
                                : "text-zinc-600 hover:text-zinc-400"
                        )}
                    >
                        {tab} <span className="opacity-50 ml-1">({tasks.filter(t => t.column === tab).length})</span>
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2 scrollbar-none py-1 px-0.5">
                {visibleTasks.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 opacity-30">
                        <CheckCircle2 size={32} strokeWidth={1} />
                        <span className="text-xs italic">No tasks in {activeTab}</span>
                    </div>
                )}

                {visibleTasks.map(task => (
                    <div key={task.id} className="group bg-white/5 hover:bg-white/10 p-2.5 rounded-xl border border-white/5 flex items-center gap-2 transition-all hover:-translate-y-1 hover:shadow-lg">
                        {/* Status Toggle Button */}
                        <button
                            onClick={() => moveTask(task.id, activeTab === 'done' ? 'todo' : 'done')}
                            className="text-zinc-500 hover:text-luxury-accent transition-colors shrink-0"
                        >
                            {activeTab === 'done' ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} />}
                        </button>

                        <span className={clsx("flex-1 text-xs font-sans font-medium tracking-wide truncate", activeTab === 'done' ? "text-zinc-600 line-through" : "text-zinc-200")}>
                            {task.text}
                        </span>

                        {/* Actions (Delete only) */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => deleteTask(task.id)} title="Delete" className="p-1 hover:bg-red-500/20 rounded text-zinc-500 hover:text-red-400">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
