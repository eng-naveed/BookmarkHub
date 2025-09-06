"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  useBookmarks,
  useUpdateBookmark,
  useDeleteBookmark,
} from "@/lib/queries";
import { AuthForm } from "@/components/auth/auth-form";
import { Sidebar } from "@/components/layout/sidebar";
import { BookmarkViews } from "@/components/bookmarks/bookmark-views";
import { Database } from "@/lib/supabase";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedFolderId, setSelectedFolderId] = useState<
    string | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleFolderSelect = (folderId?: string) => {
    setSelectedFolderId(folderId);
    setSearchQuery("");
  };

  const { data: allBookmarks, isLoading: bookmarksLoading } =
    useBookmarks(selectedFolderId);
  const updateBookmarkMutation = useUpdateBookmark();
  const deleteBookmarkMutation = useDeleteBookmark();

  const filteredBookmarks =
    allBookmarks?.filter((bookmark) => {
      if (!debouncedSearchQuery.trim()) return true;

      const query = debouncedSearchQuery.toLowerCase();
      return (
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.description?.toLowerCase().includes(query) ||
        bookmark.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }) || [];

  const handleBookmarkUpdate = async (id: string, updates: any) => {
    try {
      await updateBookmarkMutation.mutateAsync({ id, updates });
      toast.success("Bookmark updated");
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleBookmarkDelete = async (id: string) => {
    try {
      await deleteBookmarkMutation.mutateAsync(id);
      toast.success("Bookmark deleted");
    } catch (error) {
      toast.error("Failed to delete bookmark");
    }
  };

  const handleReorder = async (reorderedBookmarks: Bookmark[]) => {
    try {
      await Promise.all(
        reorderedBookmarks.map((bookmark, index) =>
          updateBookmarkMutation.mutateAsync({
            id: bookmark.id,
            updates: { sort_order: index },
          })
        )
      );
      toast.success("Bookmarks reordered");
    } catch (error) {
      toast.error("Failed to reorder bookmarks");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (
    isAuthenticated === false &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co"
  ) {
    return <AuthForm />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        selectedFolderId={selectedFolderId}
        onFolderSelect={handleFolderSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {bookmarksLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <BookmarkViews
              bookmarks={filteredBookmarks}
              onBookmarkUpdate={handleBookmarkUpdate}
              onBookmarkDelete={handleBookmarkDelete}
              onReorder={handleReorder}
              onMoveToRoot={() => handleFolderSelect(undefined)}
              searchQuery={debouncedSearchQuery}
              isSearching={searchQuery !== debouncedSearchQuery}
            />
          )}
        </div>
      </main>
    </div>
  );
}
