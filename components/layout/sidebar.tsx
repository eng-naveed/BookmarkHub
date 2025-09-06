"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useFolders, useCreateFolder } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { FolderTree } from "./folder-tree";
import { AddBookmarkDialog } from "../bookmarks/add-bookmark-dialog";
import {
  Bookmark,
  Folder,
  Plus,
  Search,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface SidebarProps {
  selectedFolderId?: string;
  onFolderSelect: (folderId?: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Sidebar({
  selectedFolderId,
  onFolderSelect,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const { user, signOut, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data: folders, isLoading } = useFolders();
  const createFolderMutation = useCreateFolder();
  const [showAddBookmark, setShowAddBookmark] = useState(false);

  // Use local user ID when not authenticated
  const userId = user?.id || "local-user";

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;

    try {
      await createFolderMutation.mutateAsync({
        user_id: userId,
        name,
        sort_order: (folders?.length || 0) + 1,
      });
      toast.success("Folder created successfully");
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const handleSignOut = async () => {
    if (!isAuthenticated) {
      // For local mode, just show a message
      toast.info("You are using local storage mode");
      return;
    }

    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="w-80 bg-card border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <Bookmark className="h-4 w-4 text-white" />
          </div>
          <h1 className="font-semibold text-lg">BookmarkHub</h1>
          {!isAuthenticated && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Local Mode
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          <Button
            variant={!selectedFolderId ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onFolderSelect()}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            All Bookmarks
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setShowAddBookmark(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Bookmark
          </Button>
        </div>
      </div>

      <Separator />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Folders</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateFolder}
            disabled={createFolderMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <FolderTree
              folders={folders || []}
              selectedFolderId={selectedFolderId}
              onFolderSelect={onFolderSelect}
            />
          )}
        </ScrollArea>
      </div>

      <div className="mt-auto p-4 border-t">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            Toggle Theme
          </Button>

          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isAuthenticated ? "Sign Out" : "Local Mode"}
          </Button>
        </div>
      </div>

      <AddBookmarkDialog
        open={showAddBookmark}
        onOpenChange={setShowAddBookmark}
      />
    </div>
  );
}
