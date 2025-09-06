"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFavicon } from "@/hooks/use-favicon";
import { getDomainFromUrl } from "@/lib/favicon";
import { Globe, RefreshCw } from "lucide-react";

interface FaviconPreviewProps {
  url: string;
  title?: string;
}

export function FaviconPreview({ url, title }: FaviconPreviewProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { favicon, isLoading, hasError } = useFavicon(url);
  const domain = getDomainFromUrl(url);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium text-sm mb-2">{title || domain}</h3>
            <p className="text-xs text-muted-foreground mb-4">{url}</p>
          </div>

          {/* Favicon Display */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center relative">
              {favicon.url && !hasError && !isLoading ? (
                <img
                  src={favicon.url}
                  alt={`${domain} favicon`}
                  className="w-12 h-12 object-contain rounded"
                  key={refreshKey}
                />
              ) : (
                <Globe className="h-8 w-8 text-muted-foreground" />
              )}

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading..."
                : hasError
                ? "Failed to load"
                : favicon.type === "logo"
                ? "Site logo"
                : favicon.type === "favicon"
                ? "Favicon"
                : "Placeholder"}
            </p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
