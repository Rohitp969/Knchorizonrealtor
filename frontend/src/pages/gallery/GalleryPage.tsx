import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { PageHero, cardGrid } from '@/components/blocks';
import { defaultGallery, type GalleryItem } from '@/lib/site-data';
import { optimizedImage } from '@/lib/cloudinary-image';

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(defaultGallery);
  const [active, setActive] = useState<GalleryItem | null>(null);

  useEffect(() => {
    apiFetch<{ gallery: GalleryItem[] }>('/public/gallery')
      .then((data) => {
        if (data.gallery?.length) setItems(data.gallery);
      })
      .catch(() => {});
  }, []);

  return (
    <main>
      <PageHero
        label="The visual archive"
        title={
          <>
            A sense of<br />
            <em className="text-[#9f7a47]">place.</em>
          </>
        }
        copy="A closer look at the textures, horizons, and details that shape the KNC point of view."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/madinat-jumeirah-canal.jpg"
      />
      <section className="bg-[#efeae2] site-section">
        <div className={`site-container ${cardGrid(items.length)}`}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item)}
              className="group card-editorial p-5 text-left transition-all"
            >
              <div className="card-media">
                <img
                  src={optimizedImage(item.image, 800)}
                  alt={item.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4">
                <p className="eyebrow text-[#9f7a47]">{item.category}</p>
                <p className="card-title mt-1 line-clamp-2 text-[#2b3242]">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
      {active && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-[#2b3242]/90 p-5 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setActive(null)}
            className="absolute right-5 top-5 text-[#faf7f1] p-2 hover:text-[#9f7a47] transition-colors"
            aria-label="Close gallery"
          >
            <X size={24} />
          </button>
          <figure className="max-h-[90vh] max-w-5xl text-center">
            <img
              src={optimizedImage(active.image, 1600)}
              alt={active.alt}
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-sm shadow-2xl"
            />
            <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-[.14em] text-[#d9c6a4]">
              {active.title} · {active.category}
            </figcaption>
          </figure>
        </div>
      )}
    </main>
  );
}
