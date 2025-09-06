"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFavicon } from "@/hooks/use-favicon";
import { getDomainFromUrl } from "@/lib/favicon";

export function FaviconTest() {
  const [testUrl, setTestUrl] = useState("https://google.com");
  const { favicon, isLoading, hasError } = useFavicon(testUrl);
  const domain = getDomainFromUrl(testUrl);

  const testUrls = [
    "https://google.com",
    "https://github.com",
    "https://stackoverflow.com",
    "https://blog.codinghorror.com",
    "https://localhost:3000",
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Favicon Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-url">Test URL</Label>
          <Input
            id="test-url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter URL to test"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Domain</h4>
            <p className="text-sm text-muted-foreground">{domain}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Favicon URL</h4>
            <p className="text-sm text-muted-foreground break-all">
              {favicon.url}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center relative">
            {favicon.url && !hasError && !isLoading ? (
              <img
                src={favicon.url}
                alt={`${domain} favicon`}
                className="w-12 h-12 object-contain"
                onError={() => console.log("Image failed to load")}
                onLoad={() => console.log("Image loaded successfully")}
              />
            ) : (
              <div className="text-center">
                <div className="text-xs text-muted-foreground">
                  {isLoading ? "Loading..." : hasError ? "Error" : "No favicon"}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Quick Tests</h4>
          <div className="flex flex-wrap gap-2">
            {testUrls.map((url) => (
              <Button
                key={url}
                variant="outline"
                size="sm"
                onClick={() => setTestUrl(url)}
              >
                {getDomainFromUrl(url)}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Status: {isLoading ? "Loading" : hasError ? "Error" : "Loaded"}</p>
          <p>Type: {favicon.type}</p>
        </div>
      </CardContent>
    </Card>
  );
}
