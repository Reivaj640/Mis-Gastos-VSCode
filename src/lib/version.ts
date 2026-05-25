export const APP_VERSION = "2.0.1";
export const APP_BUILD_DATE = "2026-05-25";

/**
 * Compare two semver version strings.
 * Returns:
 *   > 0 if a > b
 *   < 0 if a < b
 *   0 if equal
 */
export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export interface UpdateManifest {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  files: Array<{
    path: string;
    content: string; // base64-encoded
  }>;
}
