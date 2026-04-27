const {PostBuilder} = require('../patterns/PostBuilder');
const {createSummaryStrategy} = require('../patterns/PostSummaryStrategy');

class PostService {
  constructor(repository, eventBus) {
    this.repository = repository;
    this.eventBus = eventBus;
  }

  async list(summaryType = 'short') {
    const strategy = createSummaryStrategy(summaryType);
    const posts = await this.repository.findAll();

    return posts
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
      .map(post => ({
        ...post,
        summary: strategy.summarize(post)
      }));
  }

  async create(input) {
    const posts = await this.repository.findAll();
    const post = new PostBuilder(input).build();
    posts.unshift(post);
    await this.repository.saveAll(posts);
    this.eventBus.emit('post.created', post);
    return post;
  }

  async changeStatus(id, status) {
    const posts = await this.repository.findAll();
    const post = posts.find(item => item.id === id);
    if (!post) {
      return null;
    }

    post.status = status;
    post.updatedAt = new Date().toISOString();
    await this.repository.saveAll(posts);
    this.eventBus.emit('post.statusChanged', post);
    return post;
  }

  async delete(id) {
    const posts = await this.repository.findAll();
    const nextPosts = posts.filter(post => post.id !== id);
    if (nextPosts.length === posts.length) {
      return false;
    }

    await this.repository.saveAll(nextPosts);
    this.eventBus.emit('post.deleted', {id});
    return true;
  }

  async stats() {
    const posts = await this.repository.findAll();
    return posts.reduce((totals, post) => {
      totals.total += 1;
      totals[post.status] = (totals[post.status] || 0) + 1;
      return totals;
    }, {total: 0, draft: 0, published: 0, archived: 0});
  }
}

module.exports = {PostService};
