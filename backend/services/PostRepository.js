const fs = require('node:fs/promises');
const path = require('node:path');

class JsonPostRepository {
  constructor(filePath = path.join(__dirname, '..', 'data', 'posts.json')) {
    this.filePath = filePath;
  }

  async findAll() {
    const raw = await fs.readFile(this.filePath, 'utf8');
    return JSON.parse(raw);
  }

  async saveAll(posts) {
    await fs.writeFile(this.filePath, JSON.stringify(posts, null, 2));
  }
}

module.exports = {JsonPostRepository};
