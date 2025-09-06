import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { Database } from "./supabase";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
type Folder = Database["public"]["Tables"]["folders"]["Row"];
type Rule = Database["public"]["Tables"]["classification_rules"]["Row"];

const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co"
  );
};

const getLocalBookmarks = (): Bookmark[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("bookmarks");
  return stored ? JSON.parse(stored) : [];
};

const setLocalBookmarks = (bookmarks: Bookmark[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
};

const getLocalFolders = (): Folder[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("folders");
  return stored ? JSON.parse(stored) : [];
};

const setLocalFolders = (folders: Folder[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("folders", JSON.stringify(folders));
};

export function useBookmarks(folderId?: string) {
  return useQuery({
    queryKey: ["bookmarks", folderId],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        const bookmarks = getLocalBookmarks();
        let filteredBookmarks = bookmarks.filter((b) => !b.is_deleted);

        if (folderId) {
          filteredBookmarks = filteredBookmarks.filter(
            (b) => b.folder_id === folderId
          );
        } else {
          filteredBookmarks = filteredBookmarks.filter((b) => !b.folder_id);
        }

        return filteredBookmarks.sort((a, b) => a.sort_order - b.sort_order);
      }

      let query = supabase
        .from("bookmarks")
        .select("*")
        .eq("is_deleted", false)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (folderId) {
        query = query.eq("folder_id", folderId);
      } else {
        query = query.is("folder_id", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Bookmark[];
    },
  });
}

export function useBookmark(id: string) {
  return useQuery({
    queryKey: ["bookmark", id],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        const bookmarks = getLocalBookmarks();
        const bookmark = bookmarks.find((b) => b.id === id);
        if (!bookmark) throw new Error("Bookmark not found");
        return bookmark;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Bookmark;
    },
  });
}

export function useFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        return getLocalFolders().sort((a, b) => a.sort_order - b.sort_order);
      }

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Folder[];
    },
  });
}

export function useRules() {
  return useQuery({
    queryKey: ["rules"],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        return [];
      }

      const { data, error } = await supabase
        .from("classification_rules")
        .select("*")
        .order("priority", { ascending: true });
      if (error) throw error;
      return data as Rule[];
    },
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      bookmark: Database["public"]["Tables"]["bookmarks"]["Insert"]
    ) => {
      if (!isSupabaseConfigured()) {
        const bookmarks = getLocalBookmarks();
        const newBookmark: Bookmark = {
          ...bookmark,
          id: bookmark.id || crypto.randomUUID(),
          user_id: bookmark.user_id || "local-user",
          created_at: bookmark.created_at || new Date().toISOString(),
          updated_at: bookmark.updated_at || new Date().toISOString(),
          is_deleted: bookmark.is_deleted || false,
          sort_order: bookmark.sort_order || bookmarks.length,
          tags: bookmark.tags || [],
        };
        const updatedBookmarks = [...bookmarks, newBookmark];
        setLocalBookmarks(updatedBookmarks);
        return newBookmark;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .insert(bookmark)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["bookmarks"]["Update"];
    }) => {
      if (!isSupabaseConfigured()) {
        const bookmarks = getLocalBookmarks();
        const bookmarkIndex = bookmarks.findIndex((b) => b.id === id);
        if (bookmarkIndex === -1) throw new Error("Bookmark not found");

        const updatedBookmark = {
          ...bookmarks[bookmarkIndex],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        bookmarks[bookmarkIndex] = updatedBookmark;
        setLocalBookmarks(bookmarks);
        return updatedBookmark;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured()) {
        const bookmarks = getLocalBookmarks();
        const bookmarkIndex = bookmarks.findIndex((b) => b.id === id);
        if (bookmarkIndex === -1) throw new Error("Bookmark not found");

        bookmarks[bookmarkIndex] = {
          ...bookmarks[bookmarkIndex],
          is_deleted: true,
        };
        setLocalBookmarks(bookmarks);
        return;
      }

      const { error } = await supabase
        .from("bookmarks")
        .update({ is_deleted: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      folder: Database["public"]["Tables"]["folders"]["Insert"]
    ) => {
      if (!isSupabaseConfigured()) {
        const folders = getLocalFolders();
        const newFolder: Folder = {
          ...folder,
          id: folder.id || crypto.randomUUID(),
          user_id: folder.user_id || "local-user",
          created_at: folder.created_at || new Date().toISOString(),
          updated_at: folder.updated_at || new Date().toISOString(),
          sort_order: folder.sort_order || folders.length,
        };
        const updatedFolders = [...folders, newFolder];
        setLocalFolders(updatedFolders);
        return newFolder;
      }

      const { data, error } = await supabase
        .from("folders")
        .insert(folder)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Database["public"]["Tables"]["folders"]["Update"];
    }) => {
      if (!isSupabaseConfigured()) {
        const folders = getLocalFolders();
        const folderIndex = folders.findIndex((f) => f.id === id);
        if (folderIndex === -1) throw new Error("Folder not found");

        const updatedFolder = {
          ...folders[folderIndex],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        folders[folderIndex] = updatedFolder;
        setLocalFolders(folders);
        return updatedFolder;
      }

      const { data, error } = await supabase
        .from("folders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
}
