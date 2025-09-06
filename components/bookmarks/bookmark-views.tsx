"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "@/lib/supabase";
import { BookmarkCard } from "./bookmark-card";
import { BookmarkListItem } from "./bookmark-list-item";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Grid, List, LayoutGrid, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
type ViewMode = "list" | "grid" | "masonry" | "headlines";

interface BookmarkViewsProps {
  bookmarks: Bookmark[];
  onBookmarkUpdate: (id: string, updates: any) => void;
  onBookmarkDelete: (id: string) => void;
  onReorder: (bookmarks: Bookmark[]) => void;
  onMoveToRoot?: () => void;
  searchQuery?: string;
  isSearching?: boolean;
}

export function BookmarkViews({
  bookmarks,
  onBookmarkUpdate,
  onBookmarkDelete,
  onReorder,
  onMoveToRoot,
  searchQuery,
  isSearching,
}: BookmarkViewsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(bookmarks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedBookmarks = items.map((bookmark, index) => ({
      ...bookmark,
      sort_order: index,
    }));

    onReorder(updatedBookmarks);
  };

  const viewModeOptions = [
    { mode: "list" as ViewMode, icon: List, label: "List" },
    { mode: "grid" as ViewMode, icon: Grid, label: "Grid" },
    { mode: "masonry" as ViewMode, icon: LayoutGrid, label: "Masonry" },
    { mode: "headlines" as ViewMode, icon: Newspaper, label: "Headlines" },
  ];

  const renderBookmark = (bookmark: Bookmark, index: number) => {
    const commonProps = {
      bookmark,
      onUpdate: (updates: any) => onBookmarkUpdate(bookmark.id, updates),
      onDelete: () => onBookmarkDelete(bookmark.id),
      onMoveToRoot,
    };

    if (viewMode === "list" || viewMode === "headlines") {
      return (
        <BookmarkListItem
          key={bookmark.id}
          {...commonProps}
          compact={viewMode === "headlines"}
        />
      );
    }

    return <BookmarkCard key={bookmark.id} {...commonProps} />;
  };

  const getGridClass = () => {
    switch (viewMode) {
      case "grid":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
      case "masonry":
        return "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4";
      case "list":
      case "headlines":
        return "space-y-2";
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bookmarks</h2>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-1">
              Search results for &quot;{searchQuery}&quot; ({bookmarks.length}{" "}
              found)
              {isSearching && (
                <span className="ml-2 text-xs text-blue-600">Searching...</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center bg-muted rounded-lg p-1">
          {viewModeOptions.map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              className={cn("h-8 px-3", viewMode === mode && "shadow-sm")}
              onClick={() => setViewMode(mode)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="bookmarks"
          direction={
            viewMode === "list" || viewMode === "headlines"
              ? "vertical"
              : "horizontal"
          }
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                getGridClass(),
                snapshot.isDraggingOver &&
                  "bg-accent/20 rounded-lg transition-colors"
              )}
            >
              {bookmarks.map((bookmark, index) => (
                <Draggable
                  key={bookmark.id}
                  draggableId={bookmark.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        "transition-transform",
                        snapshot.isDragging && "rotate-2 scale-105 shadow-lg",
                        viewMode === "masonry" && "break-inside-avoid mb-4"
                      )}
                    >
                      {renderBookmark(bookmark, index)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {bookmarks.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Grid className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No bookmarks yet</h3>
          <p className="text-muted-foreground">
            Add your first bookmark to get started
          </p>
        </div>
      )}
    </div>
  );
}
