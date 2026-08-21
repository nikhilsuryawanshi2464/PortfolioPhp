// frontend/src/components/common/SEO.jsx
// Full SEO component — OG tags + JSON-LD structured data + canonical + noIndex
import { Helmet } from 'react-helmet-async';
import { useSettings } from '@contexts/SiteSettingsContext';

const SEO = ({
  page        = '',
  title:        titleOverride,
  description:  descOverride,
  image:        imageOverride,
  url,
  type        = 'website',
  article     = null,   // { publishedAt, author, tags, modifiedAt }
  project     = null,   // { technologies, github, live }
  noIndex     = false,
  slug        = '',
}) => {
  const { settings } = useSettings();
  const pageSeo     = (page && settings?.seo?.[page]) || {};
  const siteName    = settings?.siteName  || 'Nikhil Portfolio';
  const ownerName   = settings?.ownerName || 'Nikhil Suryawanshi';
  const siteUrl     = import.meta.env.VITE_SITE_URL || '';
  const twitterHandle = import.meta.env.VITE_TWITTER_HANDLE || '';

  const title       = titleOverride || pageSeo.title || siteName;
  const description = descOverride  || pageSeo.description
    || `${ownerName} — ${settings?.tagline || 'Full-Stack Developer'}`;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const fullTitle   = title === siteName ? title : `${title} | ${siteName}`;

  // Feature 5: Auto OG image
  const apiUrl      = import.meta.env.VITE_API_URL || '/api/v1';
  const autoOg      = page === 'blog'    && slug ? `${apiUrl}/og/blog/${slug}`
                    : page === 'project' && slug ? `${apiUrl}/og/project/${slug}`
                    : null;
  const ogImage     = imageOverride || autoOg || pageSeo.ogImage || '';

  // ── JSON-LD structured data ──────────────────────────────────────────────
  let jsonLd = null;

  if (page === 'home' || !page) {
    // Person schema for portfolio homepage
    jsonLd = {
      '@context':    'https://schema.org',
      '@type':       'Person',
      name:          ownerName,
      url:           siteUrl || canonicalUrl,
      description:   description,
      jobTitle:      settings?.tagline || 'Full-Stack Developer',
      ...(settings?.location && { address: { '@type':'PostalAddress', addressLocality: settings.location } }),
      ...(settings?.social?.github   && { sameAs: [`https://github.com/${settings.social.github}`] }),
      ...(settings?.contactEmail     && { email: settings.contactEmail }),
      knowsAbout:    ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript'],
    };
  } else if (page === 'blog' && article) {
    // Article schema for blog posts
    jsonLd = {
      '@context':         'https://schema.org',
      '@type':            'Article',
      headline:           title,
      description:        description,
      ...(ogImage && { image: ogImage }),
      datePublished:      article.publishedAt,
      dateModified:       article.modifiedAt || article.publishedAt,
      author: {
        '@type': 'Person',
        name:    article.author || ownerName,
        url:     siteUrl,
      },
      publisher: {
        '@type': 'Person',
        name:    ownerName,
        url:     siteUrl,
      },
      mainEntityOfPage: { '@type':'WebPage', '@id': canonicalUrl },
      ...(article.tags?.length && { keywords: article.tags.join(', ') }),
    };
  } else if (page === 'project' && project) {
    // SoftwareApplication schema for projects
    jsonLd = {
      '@context':          'https://schema.org',
      '@type':             'SoftwareApplication',
      name:                title,
      description:         description,
      ...(ogImage && { image: ogImage }),
      author: { '@type':'Person', name: ownerName, url: siteUrl },
      ...(project.technologies?.length && { applicationCategory: project.technologies[0] }),
      ...(project.live && { url: project.live }),
    };
  } else if (page === 'projects') {
    // ItemList schema for projects listing
    jsonLd = {
      '@context': 'https://schema.org',
      '@type':    'ItemList',
      name:       'Projects',
      description: description,
      url:         canonicalUrl,
    };
  } else {
    // WebPage schema fallback
    jsonLd = {
      '@context':    'https://schema.org',
      '@type':       'WebPage',
      name:          fullTitle,
      description:   description,
      url:           canonicalUrl,
      author: { '@type':'Person', name: ownerName, url: siteUrl },
    };
  }

  // BreadcrumbList for all non-home pages
  const pathParts = canonicalUrl.replace(siteUrl, '').split('/').filter(Boolean);
  const breadcrumb = pathParts.length > 0 ? {
    '@context':  'https://schema.org',
    '@type':     'BreadcrumbList',
    itemListElement: [
      { '@type':'ListItem', position:1, name:'Home', item: siteUrl || '/' },
      ...pathParts.map((part, i) => ({
        '@type':  'ListItem',
        position: i + 2,
        name:     part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g,' '),
        item:     `${siteUrl}/${pathParts.slice(0,i+1).join('/')}`,
      })),
    ],
  } : null;

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      {!noIndex && <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type"        content={type} />
      <meta property="og:site_name"   content={siteName} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image"  content={ogImage} />}
      {ogImage && <meta property="og:image:width"  content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card"        content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {twitterHandle && <meta name="twitter:site"    content={`@${twitterHandle}`} />}
      {twitterHandle && <meta name="twitter:creator" content={`@${twitterHandle}`} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Article meta */}
      {article?.publishedAt && <meta property="article:published_time" content={article.publishedAt} />}
      {article?.modifiedAt  && <meta property="article:modified_time"  content={article.modifiedAt} />}
      {article?.author      && <meta property="article:author"          content={article.author} />}
      {(article?.tags || []).map(tag => <meta key={tag} property="article:tag" content={tag} />)}

      {/* JSON-LD structured data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd, null, 0)}
        </script>
      )}
      {breadcrumb && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumb, null, 0)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
