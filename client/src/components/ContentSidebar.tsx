import { useState, type SubmitEvent } from "react";

import type { List } from "../types";

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

  const handleCreate = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!listName.trim()) return;
    onCreate(listName.trim());

    setListName("");
  };

  return (
    <>
      <ul className="menu w-full grow overflow-hidden ">
        <li>
          <form onSubmit={handleCreate}>
            {" "}
            <button type="submit">Add</button>
            <input
              type="text"
              name="name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-45 border border-gray-100"
            />{" "}
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
              <button
                onClick={() => onDelete(l.id)}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                className={`transition-all ease-out duration-150 ${
                  isActive
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none w-0 h-0 overflow-hidden"
                }`}
              >
                Del
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
