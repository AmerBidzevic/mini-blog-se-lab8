const postForm = document.querySelector('#post-form');
const postsElement = document.querySelector('#posts');
const statsElement = document.querySelector('#stats');
const activityElement = document.querySelector('#activity');
const summaryMode = document.querySelector('#summary-mode');

postForm.addEventListener('submit', async event => {
  event.preventDefault();
  const formData = new FormData(postForm);
  const payload = Object.fromEntries(formData.entries());

  await request('/api/posts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  postForm.reset();
  postForm.author.value = 'Amer Bidzevic';
  await refresh();
});

summaryMode.addEventListener('change', refresh);

async function refresh() {
  const [posts, stats, activity] = await Promise.all([
    request(`/api/posts?summary=${summaryMode.value}`),
    request('/api/stats'),
    request('/api/activity')
  ]);

  renderStats(stats);
  renderPosts(posts);
  renderActivity(activity);
}

function renderStats(stats) {
  statsElement.innerHTML = ['total', 'published', 'draft', 'archived']
    .map(key => `
      <div class="stat">
        <strong>${stats[key]}</strong>
        <span>${key}</span>
      </div>
    `)
    .join('');
}

function renderPosts(posts) {
  if (!posts.length) {
    postsElement.innerHTML = '<p class="summary">No posts yet.</p>';
    return;
  }

  postsElement.innerHTML = posts.map(post => `
    <article class="post">
      <div class="post-top">
        <div>
          <h3>${escapeHtml(post.title)}</h3>
          <p class="meta">/${escapeHtml(post.slug)} - ${escapeHtml(post.author)}</p>
        </div>
        <span class="badge ${post.status}">${post.status}</span>
      </div>
      <p>${escapeHtml(post.content)}</p>
      <p class="summary">${escapeHtml(post.summary)}</p>
      <p class="tags">${post.tags.map(tag => `#${escapeHtml(tag)}`).join(' ')}</p>
      <div class="actions">
        ${post.status !== 'published' ? `<button class="secondary" data-action="status" data-id="${post.id}" data-status="published">Publish</button>` : ''}
        ${post.status !== 'archived' ? `<button class="secondary" data-action="status" data-id="${post.id}" data-status="archived">Archive</button>` : ''}
        <button class="danger" data-action="delete" data-id="${post.id}">Delete</button>
      </div>
    </article>
  `).join('');

  postsElement.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', handlePostAction);
  });
}

function renderActivity(activity) {
  activityElement.innerHTML = activity.length
    ? activity.map(item => `<li>${escapeHtml(item.message)}<br><small>${new Date(item.happenedAt).toLocaleString()}</small></li>`).join('')
    : '<li>Activity will appear after you create, publish, archive, or delete posts.</li>';
}

async function handlePostAction(event) {
  const button = event.currentTarget;
  const id = button.dataset.id;

  if (button.dataset.action === 'delete') {
    await request(`/api/posts/${id}`, {method: 'DELETE'});
  }

  if (button.dataset.action === 'status') {
    await request(`/api/posts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({status: button.dataset.status})
    });
  }

  await refresh();
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {'Content-Type': 'application/json'},
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

refresh();
