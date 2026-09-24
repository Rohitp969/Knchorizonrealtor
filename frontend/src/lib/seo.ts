import { useEffect } from 'react';
import { useSiteSettings } from '@/lib/site-settings';

/**
 * Sets the tab title and meta description for a page. The site name and the fallback
 * description come from Admin > Settings, so renaming the site there renames every tab.
 */
export function usePageMeta(title: string, description: string) {
  const { siteName, seoDescription } = useSiteSettings();
  useEffect(() => {
    document.title = `${title} | ${siteName}`;
    const descriptionTag = document.querySelector('meta[name="description"]');
    descriptionTag?.setAttribute('content', description || seoDescription);
  }, [title, description, siteName, seoDescription]);
}
