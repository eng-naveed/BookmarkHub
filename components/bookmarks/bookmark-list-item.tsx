"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database } from "@/lib/supabase";
import {
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2,
  Folder,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useFavicon } from "@/hooks/use-favicon";
import { getDomainFromUrl } from "@/lib/favicon";
import { MoveToFolderDialog } from "./move-to-folder-dialog";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];

interface BookmarkListItemProps {
  bookmark: Bookmark;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  compact?: boolean;
  onMoveToRoot?: () => void;
}

export function BookmarkListItem({
  bookmark,
  onUpdate,
  onDelete,
  compact = false,
  onMoveToRoot,
}: BookmarkListItemProps) {
  const [faviconError, setFaviconError] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const {
    favicon,
    isLoading: faviconLoading,
    hasError: faviconHasError,
  } = useFavicon(bookmark.url);

  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors",
        compact && "p-3"
      )}
    >
      {/* Favicon/Icon */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
          {favicon.url && !faviconError ? (
            <img
              src={favicon.url}
              alt={`${getDomainFromUrl(bookmark.url)} favicon`}
              className="w-6 h-6 object-contain"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <Globe className="h-4 w-4 text-muted-foreground" />
          )}

          {/* Loading indicator */}
          {faviconLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium truncate cursor-pointer hover:text-blue-600",
                compact ? "text-sm" : "text-base"
              )}
              onClick={() => window.open(bookmark.url, "_blank")}
            >
              {bookmark.title}
            </h3>

            {!compact && bookmark.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {bookmark.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-muted-foreground">
                {getDomainFromUrl(bookmark.url)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(bookmark.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Tags */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {bookmark.tags.slice(0, compact ? 2 : 4).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
                {bookmark.tags.length > (compact ? 2 : 4) && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{bookmark.tags.length - (compact ? 2 : 4)}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(bookmark.url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => window.open(bookmark.url, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Link
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowMoveDialog(true)}>
                  <Folder className="mr-2 h-4 w-4" />
                  Move to Folder
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <MoveToFolderDialog
        open={showMoveDialog}
        onOpenChange={setShowMoveDialog}
        bookmark={bookmark}
        onMoveToRoot={onMoveToRoot}
      />
    </div>
  );
}
