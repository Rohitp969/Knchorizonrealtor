import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { apiFetch, type Post } from '@/lib/api';
import { PageHero, PostCard, cardGrid } from '@/components/blocks';
import { defaultPosts } from '@/lib/site-data';
import { LoadingState, ErrorState } from '@/pages/shared/listing-helpers';

export function BlogPage() {
  const [posts, setPosts] = useState<Post[]>(defaultPosts as unknown as Post[]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ blogs: Post[] }>('/blogs')
      .then((data) => {
        if (data.blogs?.length) setPosts(data.blogs);
      })
      .catch((reason) => {
        if (!posts.length) setError(reason instanceof Error ? reason.message : 'Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map((post) => post.category)))];
  const filtered = posts.filter(
    (post) =>
      (category === 'All' || post.category === category) &&
      `${post.title} ${post.excerpt}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main>
      <PageHero
        label="The KNC blog"
        title={
          <>
            Property, made<br />
            <em className="text-[#9f7a47]">clearer.</em>
          </>
        }
        copy="Practical guidance, local perspective, and thoughtful notes for your next move in Dubai real estate."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-creek-dusk.jpg"
      />
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          <div className="flex flex-col gap-5 border-b border-[#2b3242]/15 pb-7 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[.13em] ${
                    category === item ? 'bg-[#2b3242] text-[#faf7f1]' : 'border border-[#2b3242]/20'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 border-b border-[#2b3242]/25 py-2 md:w-72">
              <Search size={16} className="text-[#9f7a47]" />
              <span className="sr-only">Search blog</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the blog"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#2b3242]/65"
              />
            </label>
          </div>
          {loading ? (
            <LoadingState />
          ) : error && !filtered.length ? (
            <ErrorState message={error} />
          ) : !filtered.length ? (
            <div className="py-16 text-center">
              <p className="block-title text-[#2b3242]">No notes match this search.</p>
              <p className="mt-4 text-sm text-[#2b3242]/60">Try another phrase or category.</p>
            </div>
          ) : (
            <div className={`mt-12 ${cardGrid(filtered.length)}`}>
              {filtered.map((post) => (
                <PostCard key={post.id || post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
