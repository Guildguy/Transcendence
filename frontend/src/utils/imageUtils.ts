/**
 * Image URL validation and processing utilities
 * Handles various image formats from backend: URLs, relative paths, base64, and JSON-wrapped base64
 */

/**
 * Checks if a string is a valid image URL/path/data-url
 * @param url - The URL string to validate
 * @returns true if the URL is valid and can be used as img src
 */
export function isValidImageUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;

  // Data URL (base64)
  if (url.startsWith('data:image/')) return true;

  // HTTP(S) URL
  if (url.startsWith('http://') || url.startsWith('https://')) return true;

  // Relative path
  if (url.startsWith('/')) return true;

  return false;
}

/**
 * Extracts usable image URL from backend avatarUrl field
 * Handles:
 * - Direct URLs (http, https, /)
 * - Data URLs (data:image/...)
 * - JSON-wrapped base64 from Python service (e.g., {"image_base64": "data:image/..."})
 * 
 * @param avatarUrl - The avatarUrl from backend, could be JSON string or URL
 * @returns Valid image URL/data-url string, or null if invalid
 */
export function extractBase64FromAvatarUrl(avatarUrl: string | undefined): string | null {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null;

  // Already a valid data URL (base64)
  if (avatarUrl.startsWith('data:image/')) return avatarUrl;

  // Already a valid HTTP(S) URL
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) return avatarUrl;

  // Already a valid relative path
  if (avatarUrl.startsWith('/')) return avatarUrl;

  // Try to parse as JSON (backend response format from Python service)
  try {
    const parsed = JSON.parse(avatarUrl);
    
    // Extract base64 from parsed object
    if (parsed.image_base64 && typeof parsed.image_base64 === 'string') {
      return parsed.image_base64;
    }
    
    // Fallback to avatarUrl field if image_base64 not found
    if (parsed.avatarUrl && typeof parsed.avatarUrl === 'string') {
      return parsed.avatarUrl;
    }
  } catch {
    // Not JSON, return as-is (might be valid URL)
    return avatarUrl;
  }

  return null;
}

/**
 * Processes avatar URL safely - extracts and validates
 * @param avatarUrl - Raw avatarUrl from backend
 * @returns Processed URL ready for img src, or empty string for fallback
 */
export function processAvatarUrl(avatarUrl: string | undefined): string {
  const extracted = extractBase64FromAvatarUrl(avatarUrl);
  
  if (extracted && isValidImageUrl(extracted)) {
    return extracted;
  }
  
  return '';
}
