import { useEffect, useState, useMemo } from "react";
import api from "../../api/client";
import type { ListItem } from "../types";

export default function Content({ listId }: { listId?: string }) {
  const [itemsCache, setItemsCache] = useState<Record<string, ListItem[]>>({});

  useEffect(() => {
    if (!listId || itemsCache[listId]) return; // already cached, nothing to fetch

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

  return (
    <div className="card-grid">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        listItems.map((i) => (
          <div key={i.id}>
            <h4>{i.title}</h4>
            <p>{i.description}</p>
          </div>
        ))
      )}
      {/* <button className="absolute top-5 right-5">add</button>
      <form></form> */}
    </div>
  );
}
