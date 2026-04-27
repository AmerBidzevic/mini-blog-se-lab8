class ShortSummaryStrategy {
  summarize(post) {
    return post.excerpt || `${post.content.slice(0, 90)}${post.content.length > 90 ? '...' : ''}`;
  }
}

class ReadingTimeSummaryStrategy {
  summarize(post) {
    const words = post.content.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read - ${post.excerpt || post.content.slice(0, 90)}`;
  }
}

class EditorialSummaryStrategy {
  summarize(post) {
    return `${post.status.toUpperCase()} - ${post.title} by ${post.author}`;
  }
}

function createSummaryStrategy(type = 'short') {
  const strategies = {
    short: new ShortSummaryStrategy(),
    reading: new ReadingTimeSummaryStrategy(),
    editorial: new EditorialSummaryStrategy()
  };

  return strategies[type] || strategies.short;
}

module.exports = {
  ShortSummaryStrategy,
  ReadingTimeSummaryStrategy,
  EditorialSummaryStrategy,
  createSummaryStrategy
};
