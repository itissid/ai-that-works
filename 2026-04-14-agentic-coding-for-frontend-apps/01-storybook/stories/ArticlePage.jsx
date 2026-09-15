import React from 'react'

export const ArticlePage = ({
  title = 'Untitled',
  author = 'Unknown',
  date = '',
  heroImage = '',
  body = '',
  tags = [],
  readingTime = '',
}) => {
  const styles = {
    page: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      maxWidth: 680,
      margin: '0 auto',
      padding: '40px 24px',
      color: '#1a1a1a',
      lineHeight: 1.7,
    },
    header: {
      marginBottom: 32,
    },
    tags: {
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    tag: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#2563eb',
      backgroundColor: '#eff6ff',
      padding: '3px 10px',
      borderRadius: 100,
    },
    title: {
      fontSize: 36,
      fontWeight: 700,
      lineHeight: 1.2,
      margin: '0 0 16px',
      color: '#111',
    },
    meta: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 14,
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: '50%',
      backgroundColor: '#d1d5db',
    },
    hero: {
      width: '100%',
      height: 380,
      objectFit: 'cover',
      borderRadius: 8,
      marginBottom: 32,
      backgroundColor: '#f3f4f6',
    },
    heroPlaceholder: {
      width: '100%',
      height: 380,
      borderRadius: 8,
      marginBottom: 32,
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontFamily: 'system-ui, sans-serif',
      fontSize: 14,
    },
    body: {
      fontSize: 18,
      color: '#374151',
    },
    paragraph: {
      margin: '0 0 24px',
    },
    divider: {
      border: 'none',
      borderTop: '1px solid #e5e7eb',
      margin: '40px 0',
    },
  }

  const paragraphs = body
    ? body.split('\n\n').filter(Boolean)
    : []

  return (
    <article style={styles.page}>
      <header style={styles.header}>
        {tags.length > 0 && (
          <div style={styles.tags}>
            {tags.map((t) => (
              <span key={t} style={styles.tag}>{t}</span>
            ))}
          </div>
        )}
        <h1 style={styles.title}>{title}</h1>
        <div style={styles.meta}>
          <span>{author}</span>
          {date && <><span style={styles.dot} /><span>{date}</span></>}
          {readingTime && <><span style={styles.dot} /><span>{readingTime}</span></>}
        </div>
      </header>

      {heroImage && (
        <img src={heroImage} alt="" style={styles.hero} />
      )}

      <div style={styles.body}>
        {paragraphs.length > 0
          ? paragraphs.map((p, i) => (
              <p key={i} style={styles.paragraph}>{p}</p>
            ))
          : <p style={{ ...styles.paragraph, color: '#9ca3af' }}>No content yet.</p>
        }
      </div>

      <hr style={styles.divider} />
    </article>
  )
}
