"use client";

import { FormEvent, useState } from "react";

type TaskStatus = "To Do" | "In Progress" | "Done";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
};

const statusOptions: TaskStatus[] = ["To Do", "In Progress", "Done"];

function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("To Do");

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      return;
    }

    setTasks((currentTasks) => [
      {
        id: createTaskId(),
        title: trimmedTitle,
        description: trimmedDescription,
        status,
      },
      ...currentTasks,
    ]);
    setTitle("");
    setDescription("");
    setStatus("To Do");
  }

  function updateTaskStatus(taskId: string, nextStatus: TaskStatus) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus } : task,
      ),
    );
  }

  function deleteTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header>
          <h1 className="text-2xl font-semibold">Task Manager</h1>
          <p className="mt-1 text-sm text-slate-600">
            Add tasks and update their status.
          </p>
        </header>

        <form
          className="mt-8 grid gap-4 border-b border-slate-200 pb-8"
          onSubmit={handleAddTask}
        >
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Title
            <input
              className="h-10 rounded-md border border-slate-300 px-3 text-slate-950 outline-none focus:border-slate-950"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
              type="text"
              value={title}
            />
          </label>

          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Description
            <textarea
              className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Task description"
              value={description}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Status
              <select
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-slate-950 outline-none focus:border-slate-950"
                onChange={(event) =>
                  setStatus(event.target.value as TaskStatus)
                }
                value={status}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white disabled:bg-slate-300"
              disabled={!title.trim()}
              type="submit"
            >
              Add Task
            </button>
          </div>
        </form>

        <section className="mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <p className="text-sm text-slate-500">
              {tasks.length === 1 ? "1 task" : `${tasks.length} tasks`}
            </p>
          </div>

          {tasks.length === 0 ? (
            <p className="mt-6 rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No tasks yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              {tasks.map((task) => (
                <li key={task.id} className="py-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div>
                      <h3 className="break-words font-medium">{task.title}</h3>
                      {task.description ? (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
                          {task.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex gap-2 sm:justify-end">
                      <select
                        aria-label={`Update status for ${task.title}`}
                        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-950 outline-none focus:border-slate-950"
                        onChange={(event) =>
                          updateTaskStatus(
                            task.id,
                            event.target.value as TaskStatus,
                          )
                        }
                        value={task.status}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      <button
                        className="h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700"
                        onClick={() => deleteTask(task.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
