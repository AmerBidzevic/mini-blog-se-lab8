class CreatePostCommand {
  constructor(postService, input) {
    this.postService = postService;
    this.input = input;
  }

  async execute() {
    return this.postService.create(this.input);
  }
}

class DeletePostCommand {
  constructor(postService, id) {
    this.postService = postService;
    this.id = id;
  }

  async execute() {
    return this.postService.delete(this.id);
  }
}

class ChangeStatusCommand {
  constructor(postService, id, status) {
    this.postService = postService;
    this.id = id;
    this.status = status;
  }

  async execute() {
    return this.postService.changeStatus(this.id, this.status);
  }
}

module.exports = {CreatePostCommand, DeletePostCommand, ChangeStatusCommand};
