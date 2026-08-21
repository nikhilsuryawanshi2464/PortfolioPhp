function slugify(text = '') {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function getHeadings(content = '') {
  return content
    .split('\n')
    .map((line) => line.match(/^(#{2,3})\s+(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      level: match[1].length,
      text: match[2].trim(),
      id: slugify(match[2]),
    }));
}

export default function TableOfContents({ content = '' }) {
  const headings = getHeadings(content);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        On this page
      </p>
      <div className="space-y-2">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block text-sm transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
              heading.level === 3
                ? 'pl-3 text-slate-500 dark:text-slate-400'
                : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </nav>
  );
}
