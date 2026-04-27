const {EventBus} = require('../patterns/EventBus');
const {JsonPostRepository} = require('./PostRepository');
const {PostService} = require('./PostService');

class CmsFacade {
  constructor() {
    this.eventBus = new EventBus();
    this.postService = new PostService(new JsonPostRepository(), this.eventBus);
    this.activity = [];

    this.eventBus.on('post.created', post => this.record(`Created "${post.title}"`));
    this.eventBus.on('post.statusChanged', post => this.record(`Changed "${post.title}" to ${post.status}`));
    this.eventBus.on('post.deleted', payload => this.record(`Deleted post ${payload.id}`));
  }

  record(message) {
    this.activity.unshift({
      message,
      happenedAt: new Date().toISOString()
    });
    this.activity = this.activity.slice(0, 8);
  }

  getPostService() {
    return this.postService;
  }

  getActivity() {
    return this.activity;
  }
}

module.exports = {CmsFacade};
