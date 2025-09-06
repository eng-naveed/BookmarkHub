import { useState, useEffect } from "react";
import { FaviconResult, getDomainFromUrl } from "@/lib/favicon";

export function useFavicon(url: string) {
  const [favicon, setFavicon] = useState<FaviconResult>({
    url: "",
    type: "placeholder",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadFavicon = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Get the favicon URL immediately (no async needed for Google's service)
        const domain = getDomainFromUrl(url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        if (isMounted) {
          setFavicon({ url: faviconUrl, type: "favicon" });
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadFavicon();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { favicon, isLoading, hasError };
}
