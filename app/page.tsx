"use client";

import { FormEvent, useEffect, useState } from "react";

type TaskStatus = "To Do" | "In Progress" | "Done";

type Task = {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

const statusOptions: TaskStatus[] = ["To Do", "In Progress", "Done"];
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function requestApi<T>(path: string, options?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("To Do");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        setErrorMessage("");
        const loadedTasks = await requestApi<Task[]>("/api/tasks");

        if (isMounted) {
          setTasks(loadedTasks);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("Could not load tasks from the backend.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const createdTask = await requestApi<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          status,
        }),
      });

      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      setTitle("");
      setDescription("");
      setStatus("To Do");
    } catch {
      setErrorMessage("Could not create the task.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateTaskStatus(taskId: string, nextStatus: TaskStatus) {
    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task._id === taskId ? { ...task, status: nextStatus } : task,
      ),
    );

    try {
      setErrorMessage("");
      const updatedTask = await requestApi<Task>(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task._id === taskId ? updatedTask : task,
        ),
      );
    } catch {
      setTasks(previousTasks);
      setErrorMessage("Could not update the task status.");
    }
  }

  async function deleteTask(taskId: string) {
    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task._id !== taskId),
    );

    try {
      setErrorMessage("");
      await requestApi<null>(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
    } catch {
      setTasks(previousTasks);
      setErrorMessage("Could not delete the task.");
    }
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

        {errorMessage ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

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
              disabled={!title.trim() || isSaving}
              type="submit"
            >
              {isSaving ? "Adding..." : "Add Task"}
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

          {isLoading ? (
            <p className="mt-6 rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Loading tasks...
            </p>
          ) : tasks.length === 0 ? (
            <p className="mt-6 rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No tasks yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              {tasks.map((task) => (
                <li key={task._id} className="py-4">
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
                            task._id,
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
                        onClick={() => deleteTask(task._id)}
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
