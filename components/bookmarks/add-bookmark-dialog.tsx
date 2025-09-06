"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBookmark, useFolders } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getFaviconUrl } from "@/lib/favicon";

const bookmarkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Please enter a valid URL"),
  description: z.string().optional(),
  folderId: z.string().optional(),
  tags: z.string().optional(),
});

type BookmarkFormData = z.infer<typeof bookmarkSchema>;

interface AddBookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBookmarkDialog({
  open,
  onOpenChange,
}: AddBookmarkDialogProps) {
  const { user } = useAuth();
  const { data: folders } = useFolders();
  const createBookmarkMutation = useCreateBookmark();
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const userId = user?.id || "local-user";

  const form = useForm<BookmarkFormData>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      folderId: "",
      tags: "",
    },
  });

  const fetchMetadata = async (url: string) => {
    setIsLoadingMetadata(true);
    try {
      // For now, we'll extract the domain as a fallback title
      // later we will use the api to fetch the metadata
      const domain = new URL(url).hostname.replace("www.", "");
      if (!form.getValues("title")) {
        form.setValue("title", domain);
      }
    } catch (error) {
      // Invalid URL, ignore
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const onSubmit = async (data: BookmarkFormData) => {
    try {
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      // Fetch favicon for the bookmark
      let faviconUrl: string | undefined;
      try {
        const faviconResult = await getFaviconUrl(data.url);
        if (faviconResult.url && faviconResult.type !== "placeholder") {
          faviconUrl = faviconResult.url;
        }
      } catch (error) {
        // Favicon fetch failed, continue without it
        console.warn("Failed to fetch favicon:", error);
      }

      await createBookmarkMutation.mutateAsync({
        user_id: userId,
        title: data.title,
        url: data.url,
        description: data.description || undefined,
        folder_id: data.folderId || undefined,
        tags,
        thumbnail_url: faviconUrl,
        sort_order: 0,
      });

      toast.success("Bookmark added successfully");
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add bookmark");
    }
  };

  const handleUrlBlur = () => {
    const url = form.getValues("url");
    if (url && !form.getValues("title")) {
      fetchMetadata(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bookmark</DialogTitle>
          <DialogDescription>
            Save a new bookmark to your collection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              {...form.register("url")}
              onBlur={handleUrlBlur}
            />
            {form.formState.errors.url && (
              <p className="text-sm text-red-600">
                {form.formState.errors.url.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <div className="relative">
              <Input
                id="title"
                placeholder="Bookmark title"
                {...form.register("title")}
              />
              {isLoadingMetadata && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
            </div>
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              {...form.register("description")}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select
              onValueChange={(value) =>
                form.setValue("folderId", value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders?.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="tag1, tag2, tag3"
              {...form.register("tags")}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBookmarkMutation.isPending || isLoadingMetadata}
            >
              {createBookmarkMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Bookmark
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
