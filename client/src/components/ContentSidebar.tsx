import { useState, type SubmitEvent } from "react";

import type { List, ShareUserList } from "../types";
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
  const [listSharedWith, setListSharedWith] = useState<ShareUserList[]>([]);
  const isOwner = (list: List) => list.role === "owner";

  const handleCreate = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!listName.trim()) return;
    onCreate(listName.trim());

    setListName("");
  };

  const handleShareModalOpen = async (list: List) => {
    setOpenShareDropdown(true);
    setCurrentShareListId(list.id);
    setListSharedWith([]);

    if (!isOwner(list)) return;
    try {
      const res = await toast.promise(
        api.get(`/list/${list.id}/collaborators`),
        {
          loading: "Loading all users this list is shared with.",
          success: "Done.",
          error: (err: unknown) => {
            const axiosErr = err as AxiosError<{ error: string }>;
            return axiosErr.response?.data?.error || "failed to load users";
          },
        },
      );
      setListSharedWith(res.data);
    } catch (error) {
      const axiosErr = error as AxiosError;
      if (axiosErr.response?.status === 403) {
        setListSharedWith([]);
      } else {
        console.error(error);
      }
    }
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
      const alreadySharedWith = listSharedWith.find(
        (u) => u.invited_email.toLowerCase() === shareEmail.toLowerCase(),
      );

      if (alreadySharedWith) {
        toast.error("User has already been added.");

        return;
      }

      if (
        !shareEmail.trim().toLowerCase() ||
        !shareEmail.includes("@") ||
        !shareEmail.includes(".")
      ) {
        toast.error("Please include a valid email.");
        return;
      }
      await toast.promise(
        api.post(`/list/${currentShareListId}/share`, {
          email: shareEmail.trim().toLowerCase(),
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
                <button onClick={() => handleShareModalOpen(l)}>Share</button>
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
                  {/* {listSharedWith.invited_email} */}
                  <select
                    name="role"
                    value={shareUserRole}
                    onChange={(e) => setShareUserRole(e.target.value)}
                    className="share-modal"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>

                  {isOwner(l) && (
                    <>
                      <p>Shared with:</p>{" "}
                      {listSharedWith.map((u) => {
                        return (
                          <div key={u.id}>
                            <p>{u.invited_email}</p>
                          </div>
                        );
                      })}
                    </>
                  )}

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
