import { useEffect, useState } from "react";
import Content from "./Content";
import ContentSidebar from "./ContentSidebar";
import type { List } from "../types";
import api from "../../api/client";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

export default function ContentBody() {
  const [getLists, setGetLists] = useState<List[]>([]);

  useEffect(() => {
    api.get<List[]>("/list/todos").then((res) => {
      setGetLists(res.data);
      if (res.data.length > 0) return <p>No list</p>;
    });
  }, []);

  const handleCreateList = async (name: string) => {
    if (!name) return;
    await toast.promise(api.post("/list/new", { name: name }), {
      loading: "Creating...",
      success: "Done!",
      error: (err: unknown) => {
        const axiosErr = err as AxiosError<{ error: string }>;
        return axiosErr.response?.data?.error || "Failed to create";
      },
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
        <div className="flex min-h-full flex-col items-start   is-drawer-close:w-14 is-drawer-open:w-64">
          {/* Sidebar content here */}
          <ContentSidebar lists={getLists} onCreate={handleCreateList} />
        </div>
      </div>
    </div>
  );
}
