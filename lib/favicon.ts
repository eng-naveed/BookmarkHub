// Utility functions for fetching favicons and site logos

export interface FaviconResult {
  url: string;
  type: "favicon" | "logo" | "placeholder";
}

/**
 * Get favicon URL for a given domain
 * Uses multiple fallback strategies to find the best favicon
 */
export async function getFaviconUrl(
  websiteUrl: string
): Promise<FaviconResult> {
  try {
    const url = new URL(websiteUrl);
    const domain = url.hostname;

    // Strategy 1: Try Google's favicon service (most reliable)
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    // For Google's service, we don't need to test - it always returns something
    return { url: googleFaviconUrl, type: "favicon" };
  } catch (error) {
    console.error("Error getting favicon:", error);
    return { url: "", type: "placeholder" };
  }
}

/**
 * Get a cached favicon URL (for client-side use)
 * This avoids making network requests on every render
 */
const faviconCache = new Map<string, FaviconResult>();

export function getCachedFaviconUrl(websiteUrl: string): FaviconResult {
  const cacheKey = websiteUrl;

  if (faviconCache.has(cacheKey)) {
    return faviconCache.get(cacheKey)!;
  }

  // Return a default favicon URL that we'll try to load
  const domain = new URL(websiteUrl).hostname;
  const defaultFavicon = {
    url: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    type: "favicon" as const,
  };

  // Cache the default and let the component handle loading/fallback
  faviconCache.set(cacheKey, defaultFavicon);

  return defaultFavicon;
}

/**
 * Preload favicon for a URL (useful for batch loading)
 */
export async function preloadFavicon(websiteUrl: string): Promise<void> {
  try {
    const faviconResult = await getFaviconUrl(websiteUrl);
    if (faviconResult.url) {
      faviconCache.set(websiteUrl, faviconResult);
    }
  } catch (error) {
    console.error("Error preloading favicon:", error);
  }
}

/**
 * Get domain name from URL for display purposes
 */
export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown";
  }
}
