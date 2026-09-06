import { useEffect, useState } from "react";
import api from "../../api/client";
import type { ListItem } from "../types";

export default function Content({ listId }: { listId?: string }) {
  const [listItems, setListItems] = useState<ListItem[]>([]);

  useEffect(() => {
    api.get<ListItem[]>(`/list/${listId}/items`).then((res) => {
      setListItems(res.data);
    });
  }, [listId]);

  return (
    <div className="p-4 grid grid-flow-col grid-cols-4 gap-4">
      {listItems.map((i) => (
        <div className="" key={i.id}>
          <h4>{i.title}</h4>
          <p>{i.description}</p>
        </div>
      ))}
    </div>
  );
}
