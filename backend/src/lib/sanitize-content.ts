import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes rich text article/blog content to ensure safe HTML storage.
 * Permitted tags include headers, standard formatting, lists, links, blockquotes,
 * figures, and responsive images with appropriate Cloudinary / secure HTTPS sources.
 */
export function sanitizeArticleContent(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr", "span", "div",
      "strong", "b", "em", "i", "u", "s", "strike", "mark",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td"
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title", "class"],
      img: ["src", "srcset", "alt", "title", "width", "height", "loading", "class", "style"],
      span: ["class", "style"],
      p: ["class", "style"],
      div: ["class", "style"],
      h1: ["class", "style"],
      h2: ["class", "style"],
      h3: ["class", "style"],
      h4: ["class", "style"],
      h5: ["class", "style"],
      h6: ["class", "style"],
      blockquote: ["class", "style"],
      ul: ["class", "style"],
      ol: ["class", "style"],
      li: ["class", "style"],
      table: ["class", "style"],
      th: ["class", "style", "scope", "colspan", "rowspan"],
      td: ["class", "style", "colspan", "rowspan"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        "float": [/^left$/, /^right$/, /^none$/],
      },
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const isExternal = /^https?:\/\//i.test(href);
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
      img: (tagName, attribs) => {
        return {
          tagName: "img",
          attribs: {
            loading: "lazy",
            ...attribs,
          },
        };
      },
    },
  });
}
