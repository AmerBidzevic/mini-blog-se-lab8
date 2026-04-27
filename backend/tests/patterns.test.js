const test = require('node:test');
const assert = require('node:assert/strict');
const {PostBuilder} = require('../patterns/PostBuilder');
const {createSummaryStrategy} = require('../patterns/PostSummaryStrategy');
const {EventBus} = require('../patterns/EventBus');

test('PostBuilder creates a complete draft post from partial input', () => {
  const post = new PostBuilder({
    title: '  Ghost style editor  ',
    content: 'A tiny CMS post body.',
    tags: 'ghost, cms'
  }).build();

  assert.equal(post.title, 'Ghost style editor');
  assert.equal(post.slug, 'ghost-style-editor');
  assert.equal(post.status, 'draft');
  assert.deepEqual(post.tags, ['ghost', 'cms']);
});

test('summary strategy can switch behavior without changing post data', () => {
  const post = {
    title: 'Patterns',
    content: 'Design patterns improve extensibility.',
    excerpt: 'Design patterns improve extensibility.',
    status: 'published',
    author: 'Amer'
  };

  assert.equal(createSummaryStrategy('editorial').summarize(post), 'PUBLISHED - Patterns by Amer');
  assert.match(createSummaryStrategy('reading').summarize(post), /1 min read/);
});

test('EventBus notifies observers when an event is emitted', () => {
  const bus = new EventBus();
  let message = '';
  bus.on('post.created', post => {
    message = post.title;
  });

  bus.emit('post.created', {title: 'Observer example'});

  assert.equal(message, 'Observer example');
});
