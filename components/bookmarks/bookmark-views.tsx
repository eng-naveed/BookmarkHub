"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "@/lib/supabase";
import { BookmarkCard } from "./bookmark-card";
import { BookmarkListItem } from "./bookmark-list-item";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
 } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
 } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

// single sortable item wrapper using dnd-kit
function SortableItem({id, children, viewMode }: { id: string, children: React.ReactNode, viewMode: ViewMode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    touchAction: "manipulation",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "transition-transform duration-200 ease-in-out",
        isDragging && "scale-105 shadow-lg",
        viewMode === "masonry" && "break-inside-avoid mv-4"
      )}
    >
      {children}
    </div>
  );
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

  // sensors for pointer and keyboard
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, // Only start dragging after pointer moved 5px
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useSensors(pointerSensor, keyboardSensor);

  const ids = useMemo(() => bookmarks.map((b) => String(b.id)), [bookmarks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(bookmarks, oldIndex, newIndex);
    const updated = newOrder.map((b, i) => ({ ...b, sort_order: i }));

    // send new order upstream
    onReorder(updated);
  }

  const viewModeOptions = [
    { mode: "list" as ViewMode, icon: List, label: "List" },
    { mode: "grid" as ViewMode, icon: Grid, label: "Grid" },
    { mode: "masonry" as ViewMode, icon: LayoutGrid, label: "Masonry" },
    { mode: "headlines" as ViewMode, icon: Newspaper, label: "Headlines" },
  ];

  const renderBookmark = (bookmark: Bookmark) => {
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
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr"
        // return "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4";
      case "list":
      case "headlines":
        return "space-y-2";
      default:
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
    }
  };

  const sortingStrategy = 
    viewMode === "list" || viewMode === "headlines"
      ? verticalListSortingStrategy
      : rectSortingStrategy;

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

        <div className="flex items-center bg-muted rounded-lg p-2">
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={sortingStrategy}>
          <div
            className={cn(getGridClass(), "relative")}
            // for smooth animation of grid children
            style={{ gridAutoRows: "1fr" }}
          >
            {bookmarks.map((bookmark) => (
              <SortableItem
                key={bookmark.id}
                id={String(bookmark.id)}
                viewMode={viewMode}
              >
                {renderBookmark(bookmark)}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
