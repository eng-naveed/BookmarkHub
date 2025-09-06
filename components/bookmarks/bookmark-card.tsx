"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

interface BookmarkCardProps {
  bookmark: Bookmark;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  onMoveToRoot?: () => void;
}

export function BookmarkCard({
  bookmark,
  onUpdate,
  onDelete,
  onMoveToRoot,
}: BookmarkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const {
    favicon,
    isLoading: faviconLoading,
    hasError: faviconError,
  } = useFavicon(bookmark.url);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {bookmark.thumbnail_url && !imageError ? (
            <img
              src={bookmark.thumbnail_url}
              alt={bookmark.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center relative">
              {/* Favicon */}
              {favicon.url && !imageError ? (
                <div className="flex items-center justify-center w-full h-full">
                  <img
                    src={favicon.url}
                    alt={`${getDomainFromUrl(bookmark.url)} favicon`}
                    className="w-12 h-12 object-contain rounded-lg shadow-sm"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <Globe className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {getDomainFromUrl(bookmark.url)}
                  </span>
                </div>
              )}

              {/* Loading indicator */}
              {faviconLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* Actions overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
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

        {/* Content */}
        <div className="p-4">
          <div className="space-y-2">
            <h3
              className="font-medium text-sm line-clamp-2 leading-tight cursor-pointer hover:text-blue-600"
              onClick={() => window.open(bookmark.url, "_blank")}
            >
              {bookmark.title}
            </h3>

            {bookmark.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {bookmark.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{getDomainFromUrl(bookmark.url)}</span>
              <span>
                {formatDistanceToNow(new Date(bookmark.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Tags */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {bookmark.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
                {bookmark.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{bookmark.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <MoveToFolderDialog
        open={showMoveDialog}
        onOpenChange={setShowMoveDialog}
        bookmark={bookmark}
        onMoveToRoot={onMoveToRoot}
      />
    </Card>
  );
}
