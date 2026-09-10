import { useEffect } from 'react';

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | KNC Horizon Realtor`;
    const descriptionTag = document.querySelector('meta[name="description"]');
    descriptionTag?.setAttribute('content', description);
  }, [title, description]);
}
