/**
 * notion-to-html.js
 * Fetches "Ready to Publish" posts from Notion, generates HTML files,
 * updates blog.html index, and marks posts as Published.
 *
 * Required env vars:
 *   NOTION_SECRET     — Integration secret
 *   NOTION_DATABASE_ID — Database ID
 */

const fs = require('fs');
const path = require('path');

const NOTION_SECRET = process.env.NOTION_SECRET;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const TEMPLATE_PATH = path.join(__dirname, '../blog/post-template.html');
const BLOG_DIR = path.join(__dirname, '../blog');
const BLOG_INDEX = path.join(__dirname, '../blog.html');

async function notionFetch(endpoint, options = {}) {
  const res = await fetch(`https://api.notion.com/v1${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${NOTION_SECRET}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Fetch all "Ready to Publish" pages from the database
async function fetchReadyPosts() {
  const data = await notionFetch(`/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        property: 'Status',
        select: { equals: 'Ready to Publish' },
      },
      sorts: [{ property: 'Published Date', direction: 'descending' }],
    }),
  });
  return data.results;
}

// Fetch all Published pages (for building the index)
async function fetchPublishedPosts() {
  const data = await notionFetch(`/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        property: 'Status',
        select: { equals: 'Published' },
      },
      sorts: [{ property: 'Published Date', direction: 'descending' }],
    }),
  });
  return data.results;
}

// Fetch page block content
async function fetchBlocks(pageId) {
  const data = await notionFetch(`/blocks/${pageId}/children?page_size=100`);
  return data.results;
}

// Convert rich text array to HTML string
function richTextToHtml(richTexts) {
  return richTexts.map(rt => {
    let text = rt.plain_text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    if (rt.annotations.bold) text = `<strong>${text}</strong>`;
    if (rt.annotations.italic) text = `<em>${text}</em>`;
    if (rt.annotations.code) text = `<code>${text}</code>`;
    if (rt.href) text = `<a href="${rt.href}">${text}</a>`;
    return text;
  }).join('');
}

// Convert Notion blocks to HTML
function blocksToHtml(blocks) {
  let html = '';
  let inBulletList = false;
  let inNumberedList = false;

  for (const block of blocks) {
    // Close open lists if block type changes
    if (block.type !== 'bulleted_list_item' && inBulletList) {
      html += '</ul>\n';
      inBulletList = false;
    }
    if (block.type !== 'numbered_list_item' && inNumberedList) {
      html += '</ol>\n';
      inNumberedList = false;
    }

    switch (block.type) {
      case 'paragraph': {
        const text = richTextToHtml(block.paragraph.rich_text);
        if (text.trim()) html += `<p>${text}</p>\n`;
        break;
      }
      case 'heading_1': {
        const text = richTextToHtml(block.heading_1.rich_text);
        html += `<h2>${text}</h2>\n`;
        break;
      }
      case 'heading_2': {
        const text = richTextToHtml(block.heading_2.rich_text);
        html += `<h2>${text}</h2>\n`;
        break;
      }
      case 'heading_3': {
        const text = richTextToHtml(block.heading_3.rich_text);
        html += `<h3>${text}</h3>\n`;
        break;
      }
      case 'bulleted_list_item': {
        if (!inBulletList) { html += '<ul>\n'; inBulletList = true; }
        const text = richTextToHtml(block.bulleted_list_item.rich_text);
        html += `  <li>${text}</li>\n`;
        break;
      }
      case 'numbered_list_item': {
        if (!inNumberedList) { html += '<ol>\n'; inNumberedList = true; }
        const text = richTextToHtml(block.numbered_list_item.rich_text);
        html += `  <li>${text}</li>\n`;
        break;
      }
      case 'quote': {
        const text = richTextToHtml(block.quote.rich_text);
        html += `<blockquote><p>${text}</p></blockquote>\n`;
        break;
      }
      case 'divider': {
        html += `<hr>\n`;
        break;
      }
      default:
        // Skip unsupported block types silently
        break;
    }
  }

  // Close any still-open lists
  if (inBulletList) html += '</ul>\n';
  if (inNumberedList) html += '</ol>\n';

  return html;
}

// Extract string property from Notion page
function getProp(page, name, type) {
  const prop = page.properties[name];
  if (!prop) return '';
  switch (type) {
    case 'title':
      return prop.title?.map(t => t.plain_text).join('') || '';
    case 'rich_text':
      return prop.rich_text?.map(t => t.plain_text).join('') || '';
    case 'select':
      return prop.select?.name || '';
    case 'date':
      return prop.date?.start || '';
    case 'multi_select':
      return prop.multi_select?.map(t => t.name) || [];
    default:
      return '';
  }
}

// Format date for display: "March 20, 2026"
function formatDateDisplay(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// Build a post card HTML for blog.html index
function buildPostCard(title, slug, excerpt, dateDisplay, tags) {
  const tagHtml = tags.length ? `<span class="post-tag">${tags[0]}</span>` : '';
  return `
    <div class="post-card">
      <div class="post-card-meta">
        <span class="post-date">${dateDisplay}</span>
        ${tagHtml}
      </div>
      <h2>${title}</h2>
      <p>${excerpt}</p>
      <a href="blog/${slug}.html" class="read-more">Read more →</a>
    </div>`;
}

// Mark a Notion page as Published
async function markPublished(pageId) {
  await notionFetch(`/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        Status: { select: { name: 'Published' } },
      },
    }),
  });
}

async function main() {
  if (!NOTION_SECRET || !DATABASE_ID) {
    console.error('Missing NOTION_SECRET or NOTION_DATABASE_ID');
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // 1. Fetch and publish new posts
  const readyPosts = await fetchReadyPosts();
  console.log(`Found ${readyPosts.length} post(s) ready to publish`);

  for (const page of readyPosts) {
    const title   = getProp(page, 'Name', 'title');
    const slug    = getProp(page, 'Slug', 'rich_text');
    const excerpt = getProp(page, 'Excerpt', 'rich_text');
    const date    = getProp(page, 'Published Date', 'date');
    const tags    = getProp(page, 'Tags', 'multi_select');

    if (!slug) {
      console.warn(`Skipping "${title}" — no Slug set`);
      continue;
    }

    const blocks = await fetchBlocks(page.id);
    const bodyHtml = blocksToHtml(blocks);
    const dateDisplay = formatDateDisplay(date);
    const tagsHtml = tags.map(t => `<span class="article-tag">${t}</span>`).join('\n    ');

    const html = template
      .replace(/{{POST_TITLE}}/g, title)
      .replace(/{{POST_SLUG}}/g, slug)
      .replace(/{{POST_EXCERPT}}/g, excerpt)
      .replace(/{{POST_DATE_ISO}}/g, date)
      .replace(/{{POST_DATE_DISPLAY}}/g, dateDisplay)
      .replace(/{{POST_TAGS_HTML}}/g, tagsHtml)
      .replace(/{{POST_BODY}}/g, bodyHtml);

    const outPath = path.join(BLOG_DIR, `${slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`✓ Published: blog/${slug}.html`);

    await markPublished(page.id);
  }

  // 2. Rebuild blog.html index from all published posts
  const publishedPosts = await fetchPublishedPosts();
  console.log(`Building index with ${publishedPosts.length} published post(s)`);

  if (publishedPosts.length === 0) {
    console.log('No published posts — leaving empty state in blog.html');
    return;
  }

  const cards = publishedPosts.map(page => {
    const title   = getProp(page, 'Name', 'title');
    const slug    = getProp(page, 'Slug', 'rich_text');
    const excerpt = getProp(page, 'Excerpt', 'rich_text');
    const date    = getProp(page, 'Published Date', 'date');
    const tags    = getProp(page, 'Tags', 'multi_select');
    return buildPostCard(title, slug, excerpt, formatDateDisplay(date), tags);
  }).join('\n');

  const gridHtml = `<div class="blog-grid">${cards}\n  </div>`;

  let indexHtml = fs.readFileSync(BLOG_INDEX, 'utf8');
  indexHtml = indexHtml.replace(
    /<!-- POSTS_START -->[\s\S]*?<!-- POSTS_END -->/,
    `<!-- POSTS_START -->\n    ${gridHtml}\n    <!-- POSTS_END -->`
  );
  fs.writeFileSync(BLOG_INDEX, indexHtml, 'utf8');
  console.log('✓ blog.html index updated');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
