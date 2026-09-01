export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface List {
  id: string;
  user_id: string;
  name: string;
  role: "owner" | "editor" | "viewer";
  created_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  title: string;
  description: string;
  is_done: string;
  created_at: string;
}

export interface ShareList {
  id: string;
  list_id: string;
  user_id: string;
  email: string;
  role: "editor" | "viewer";
}
