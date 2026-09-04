import { useEffect, useState } from "react";
import Content from "./Content";
import ContentSidebar from "./ContentSidebar";
import type { List } from "../types";
import api from "../../api/client";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

export default function ContentBody() {
  const [getLists, setGetLists] = useState<List[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  // const activeList = getLists.find((l) => l.id === activeListId);
  console.log(`From content body ${activeListId}`);
  useEffect(() => {
    api.get<List[]>("/list/todos").then((res) => {
      setGetLists(res.data);
      if (res.data.length > 0) setActiveListId(res.data[0].id);
    });
  }, []);

  const handleCreateList = async (name: string) => {
    if (!name) return;
    const res = await toast.promise(api.post("/list/new", { name: name }), {
      loading: "Creating...",
      success: "Done!",
      error: (err: unknown) => {
        const axiosErr = err as AxiosError<{ error: string }>;
        return axiosErr.response?.data?.error || "Failed to create";
      },
    });
    setGetLists((prev) => [...prev, res.data]);
    setActiveListId(res.data.id);
  };

  const handleDelete = async (id: string) => {
    await toast.promise(api.delete(`/list/delete/${id}`), {
      loading: "Deleting.",
      success: "Deleted.",
      error: (err: unknown) => {
        const axiosErr = err as AxiosError<{ error: string }>;
        return axiosErr.response?.data?.error || "Failed to delete";
      },
    });

    setGetLists((prev) => {
      const update = prev.filter((l) => l.id !== id);
      if (activeListId === id) {
        setActiveListId(update.length > 0 ? update[0].id : null);
      }

      return update;
    });
  };
  return (
    <div className="drawer lg:drawer-open">
      <input
        id="my-drawer-4"
        type="checkbox"
        className="drawer-toggle inline"
      />
      <div className="drawer-content">
        <Content />
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible sidebar-background">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="flex min-h-full flex-col items-start   is-drawer-close:w-14 is-drawer-open:w-64 ">
          {/* Sidebar content here */}
          <ContentSidebar
            lists={getLists}
            onCreate={handleCreateList}
            activeListId={activeListId}
            onSelect={setActiveListId}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
