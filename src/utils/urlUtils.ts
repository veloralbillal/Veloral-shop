/**
 * Safe dynamic URL router and state synchronizer for Shared Hosting / cPanel / Subdirectories.
 * Instead of hardcoded paths that break on Apache/Nginx subfolders, this manages query parameters.
 */

export interface AppUrlState {
  page?: string;
  category?: string;
  promo?: string;
  product?: string;
}

export function getAppUrlState(): AppUrlState {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      page: params.get('page') || undefined,
      category: params.get('category') || undefined,
      promo: params.get('promo') || undefined,
      product: params.get('product') || undefined,
    };
  } catch (e) {
    return {};
  }
}

export function updateAppUrl(params: Record<string, string | null | undefined>): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.history.pushState({ path: url.toString() }, '', url.toString());
  } catch (e) {
    console.error('Failed to update URL safely:', e);
  }
}
