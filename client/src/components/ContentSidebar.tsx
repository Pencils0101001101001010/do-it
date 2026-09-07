import { useState, type SubmitEvent } from "react";

import type { List } from "../types";
import toast from "react-hot-toast";
import api from "../../api/client";
import { AxiosError } from "axios";

interface props {
  lists: List[];
  activeListId: string | null;
  onCreate: (name: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ContentSidebar({
  lists,
  onCreate,
  activeListId,
  onSelect,
  onDelete,
}: props) {
  const [listName, setListName] = useState("");
  const [openShareDropdown, setOpenShareDropdown] = useState(false);
  const [currentShareListId, setCurrentShareListId] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareUserRole, setShareUserRole] = useState("viewer");

  const handleCreate = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!listName.trim()) return;
    onCreate(listName.trim());

    setListName("");
  };

  const handleShareModalOpen = (listId: string) => {
    setOpenShareDropdown(true);
    setCurrentShareListId(listId);
  };

  const handleCloseShareModal = () => {
    setOpenShareDropdown(false);
    setCurrentShareListId("");
    setShareEmail("");
    setShareUserRole("viewer");
  };

  const handleShareSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(
    //   `List Id: ${currentShareListId}\n User email ${shareEmail} \n User role: ${shareUserRole}`,
    // );
    try {
      if (!shareEmail) {
        toast.error("Please include a email to share to.");
        return;
      }
      await toast.promise(
        api.post(`/list/${currentShareListId}/share`, {
          email: shareEmail,
          role: shareUserRole,
        }),
        {
          loading: "Sharing.",
          success: "List shared.",
          error: (err: unknown) => {
            const axiosErr = err as AxiosError<{ error: string }>;
            return axiosErr.response?.data?.error || "Failed to share";
          },
        },
      );

      setCurrentShareListId("");
      setShareEmail("");
      setShareUserRole("viewer");
      setOpenShareDropdown(false);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <ul className="menu w-full grow overflow-hidden ">
        <li>
          <form onSubmit={handleCreate} className="flex flex-col gap-y-3 ">
            <input
              type="text"
              name="name"
              value={listName}
              placeholder="List name"
              onChange={(e) => setListName(e.target.value)}
              className=" share-modal "
            />
            <button type="submit" className="share-modal-button">
              Add
            </button>
          </form>
        </li>
        {lists.map((l) => {
          const isActive = l.id === activeListId;
          return (
            <li key={l.id} className={l.id === activeListId ? "active" : ""}>
              <button
                onClick={() => onSelect(l.id)}
                className="is-drawer-close:tooltip is-drawer-close:tooltip-right "
                data-tip="Homepage"
              >
                <p>→</p>
                <span className="is-drawer-close:hidden">{l.name}</span>
              </button>{" "}
              <span
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                className={`transition-all ease-out duration-150 ${
                  isActive
                    ? "flex justify-between opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none w-0 h-0 overflow-hidden"
                }`}
              >
                <button onClick={() => onDelete(l.id)}>Delete</button>
                <button onClick={() => handleShareModalOpen(l.id)}>
                  Share
                </button>
              </span>
              {openShareDropdown && currentShareListId === l.id ? (
                <form
                  onSubmit={handleShareSubmit}
                  className={`flex flex-col gap-y-3  transition-all ease-out duration-150 ${
                    isActive
                      ? "items-start opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none w-0 h-0 overflow-hidden"
                  }`}
                >
                  <label>
                    Email
                    <input
                      type="text"
                      name="email"
                      className="share-modal"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                  </label>

                  <select
                    name="role"
                    value={shareUserRole}
                    onChange={(e) => setShareUserRole(e.target.value)}
                    className="share-modal"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>

                  <p className="flex justify-between w-full">
                    <button type="submit" className="share-modal-button">
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseShareModal}
                      className="share-modal-button"
                    >
                      cancel
                    </button>
                  </p>
                </form>
              ) : (
                ""
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
