import { useEffect, useState, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import api from "../../api/client";
import type { ListItem } from "../types";

const LONG_PRESS_MS = 500;

export default function Content({ listId }: { listId?: string }) {
  const [itemsCache, setItemsCache] = useState<Record<string, ListItem[]>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [pendingToggle, setPendingToggle] = useState<Set<string>>(new Set());
  const [pressingId, setPressingId] = useState<string | null>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!listId || itemsCache[listId]) return;

    const controller = new AbortController();

    api
      .get<ListItem[]>(`/list/${listId}/items`, { signal: controller.signal })
      .then((res) => {
        setItemsCache((prev) => ({ ...prev, [listId]: res.data }));
      })
      .catch((err) => {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error(err);
        }
      });

    return () => controller.abort();
  }, [listId, itemsCache]);

  const listItems = useMemo(
    () => (listId ? (itemsCache[listId] ?? []) : []),
    [listId, itemsCache],
  );

  const isLoading = !!listId && !itemsCache[listId];

  const handleToggleDone = async (item: ListItem) => {
    if (!listId || pendingToggle.has(item.id)) return;

    const nextDone = !item.is_done;

    setItemsCache((prev) => ({
      ...prev,
      [listId]: prev[listId].map((i) =>
        i.id === item.id ? { ...i, is_done: nextDone } : i,
      ),
    }));
    setPendingToggle((prev) => new Set(prev).add(item.id));

    try {
      await api.patch(`/items/${listId}/item/${item.id}`, {
        is_done: nextDone,
      });
    } catch (err) {
      setItemsCache((prev) => ({
        ...prev,
        [listId]: prev[listId].map((i) =>
          i.id === item.id ? { ...i, is_done: item.is_done } : i,
        ),
      }));
      const axiosErr = err as AxiosError<{ error: string }>;
      toast.error(axiosErr.response?.data?.error || "Failed to update item");
    } finally {
      setPendingToggle((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleAddItem = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!listId || !newTitle.trim()) return;

    try {
      const res = await toast.promise(
        api.post<ListItem>(`/list/${listId}/new`, {
          title: newTitle.trim(),
          description: newDescription.trim(),
          is_done: false,
        }),
        {
          loading: "Adding item.",
          success: "Item added.",
          error: (err: unknown) => {
            const axiosErr = err as AxiosError<{ error: string }>;
            return axiosErr.response?.data?.error || "Failed to add item";
          },
        },
      );

      setItemsCache((prev) => ({
        ...prev,
        [listId]: [...(prev[listId] ?? []), res.data],
      }));
      setNewTitle("");
      setNewDescription("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (item: ListItem) => {
    if (!listId) return;

    const previousItems = itemsCache[listId] ?? [];

    // optimistic removal
    setItemsCache((prev) => ({
      ...prev,
      [listId]: prev[listId].filter((i) => i.id !== item.id),
    }));

    try {
      await toast.promise(api.delete(`/items/${listId}/item/${item.id}`), {
        loading: "Deleting item.",
        success: "Item deleted.",
        error: (err: unknown) => {
          const axiosErr = err as AxiosError<{ error: string }>;
          return axiosErr.response?.data?.error || "Failed to delete item";
        },
      });
    } catch (err) {
      // revert on failure
      setItemsCache((prev) => ({ ...prev, [listId]: previousItems }));
      console.error(err);
    }
  };

  // --- press handlers: double-click on desktop, long-press on touch ---

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressingId(null);
  };

  const handleTouchStart = (item: ListItem) => {
    setPressingId(item.id);
    longPressTimer.current = setTimeout(() => {
      handleDeleteItem(item);
      clearLongPress();
    }, LONG_PRESS_MS);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-200">Items</h2>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 backdrop-blur transition-colors hover:bg-white/10"
        >
          {showAddForm ? "Close" : "Add"}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddItem}
          className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
            Title
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-slate-100 outline-none focus:border-sky-400/60"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
            Description
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-slate-100 outline-none focus:border-sky-400/60"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-sky-500/80 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
          >
            Save
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-slate-400">Loading...</p>
      ) : listItems.length === 0 ? (
        <p className="text-slate-400">
          No items yet. open sidebar and a list to start
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listItems.map((i) => (
            <div
              key={i.id}
              onDoubleClick={() => handleDeleteItem(i)}
              onTouchStart={() => handleTouchStart(i)}
              onTouchEnd={clearLongPress}
              onTouchMove={clearLongPress}
              onContextMenu={(e) => e.preventDefault()}
              className={`flex select-none flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur transition-all ${
                pressingId === i.id
                  ? "scale-95 border-red-400/50 bg-red-500/10"
                  : "hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-slate-100">{i.title}</h4>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={i.is_done}
                  onClick={() => handleToggleDone(i)}
                  disabled={pendingToggle.has(i.id)}
                  className={`mt-1 h-4 w-4 shrink-0 rounded-full border transition-colors ${
                    i.is_done
                      ? "border-sky-400 bg-sky-400/80 shadow-[0_0_6px_rgba(56,189,248,0.7)]"
                      : "border-slate-400/60 bg-transparent"
                  }`}
                />
              </div>
              {i.description && (
                <p className="text-sm text-slate-400">{i.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
