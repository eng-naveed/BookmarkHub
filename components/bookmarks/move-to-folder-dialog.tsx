"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Database } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useFolders, useUpdateBookmark } from "@/lib/queries";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

interface MoveToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark: Bookmark | null;
  onMoveToRoot?: () => void;
}

export function MoveToFolderDialog({
  open,
  onOpenChange,
  bookmark,
  onMoveToRoot,
}: MoveToFolderDialogProps) {
  const { data: folders } = useFolders();
  const updateBookmarkMutation = useUpdateBookmark();
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    bookmark?.folder_id || "none"
  );

  const handleMove = async () => {
    if (!bookmark) return;

    try {
      await updateBookmarkMutation.mutateAsync({
        id: bookmark.id,
        updates: {
          folder_id:
            selectedFolderId === "none"
              ? undefined
              : selectedFolderId || undefined,
        },
      });

      toast.success("Bookmark moved successfully");

      if (selectedFolderId === "none" && onMoveToRoot) {
        onMoveToRoot();
      }

      onOpenChange(false);
      setSelectedFolderId(bookmark?.folder_id || "none");
    } catch (error) {
      toast.error("Failed to move bookmark");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedFolderId(bookmark?.folder_id || "none");
  };

  if (!bookmark) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Bookmark</DialogTitle>
          <DialogDescription>
            Move &quot;{bookmark.title}&quot; to a different folder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Folder</label>
            <Select
              value={selectedFolderId}
              onValueChange={setSelectedFolderId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a folder (or leave in root)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder (root)</SelectItem>
                {folders?.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={updateBookmarkMutation.isPending}
            >
              {updateBookmarkMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Move Bookmark
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
