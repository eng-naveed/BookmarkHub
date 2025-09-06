"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Database } from "@/lib/supabase";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId?: string;
  onFolderSelect: (folderId: string) => void;
  level?: number;
}

export function FolderTree({
  folders,
  selectedFolderId,
  onFolderSelect,
  level = 0,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const rootFolders = folders.filter((folder) => !folder.parent_folder_id);
  const getFolderChildren = (parentId: string) =>
    folders.filter((folder) => folder.parent_folder_id === parentId);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const FolderItem = ({ folder }: { folder: Folder }) => {
    const children = getFolderChildren(folder.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div className="space-y-1">
        <div className="flex items-center group">
          {hasChildren ? (
            <Collapsible
              open={isExpanded}
              onOpenChange={() => toggleFolder(folder.id)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6 mr-1">
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          ) : (
            <div className="w-7" />
          )}

          <Button
            variant={isSelected ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "flex-1 justify-start h-8 px-2",
              "hover:bg-accent hover:text-accent-foreground",
              level > 0 && "ml-4"
            )}
            onClick={() => onFolderSelect(folder.id)}
          >
            {isSelected || isExpanded ? (
              <FolderOpen className="mr-2 h-4 w-4" />
            ) : (
              <Folder className="mr-2 h-4 w-4" />
            )}
            <span className="truncate">{folder.name}</span>
          </Button>
        </div>

        {hasChildren && (
          <Collapsible open={isExpanded}>
            <CollapsibleContent className="ml-4">
              <FolderTree
                folders={children}
                selectedFolderId={selectedFolderId}
                onFolderSelect={onFolderSelect}
                level={level + 1}
              />
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {rootFolders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </div>
  );
}
