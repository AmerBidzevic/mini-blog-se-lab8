const crypto = require('node:crypto');

class PostBuilder {
  constructor(input = {}) {
    this.input = input;
    this.post = {
      id: input.id || `post-${crypto.randomUUID()}`,
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: 'draft',
      author: 'Amer Bidzevic',
      tags: [],
      createdAt: input.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  withTitle() {
    const title = clean(this.input.title) || 'Untitled post';
    this.post.title = title;
    this.post.slug = clean(this.input.slug) || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return this;
  }

  withContent() {
    const content = clean(this.input.content);
    this.post.content = content;
    this.post.excerpt = clean(this.input.excerpt) || `${content.slice(0, 140)}${content.length > 140 ? '...' : ''}`;
    return this;
  }

  withPublishingDetails() {
    const allowedStatuses = new Set(['draft', 'published', 'archived']);
    this.post.status = allowedStatuses.has(this.input.status) ? this.input.status : 'draft';
    this.post.author = clean(this.input.author) || 'Amer Bidzevic';
    this.post.tags = parseTags(this.input.tags);
    return this;
  }

  build() {
    return this
      .withTitle()
      .withContent()
      .withPublishingDetails()
      .post;
  }
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseTags(value) {
  if (Array.isArray(value)) {
    return value.map(clean).filter(Boolean);
  }

  return clean(value)
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
}

module.exports = {PostBuilder, parseTags};
