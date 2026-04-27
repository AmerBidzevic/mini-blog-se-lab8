const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const {URL} = require('node:url');
const {CmsFacade} = require('./services/CmsFacade');
const {CreatePostCommand, DeletePostCommand, ChangeStatusCommand} = require('./patterns/PostCommand');
const {withRequestLog} = require('./patterns/withRequestLog');

const PORT = Number(process.env.PORT || 3000);
const frontendDir = path.join(__dirname, '..', 'frontend');
const cms = new CmsFacade();
const postService = cms.getPostService();

const routes = [
  ['GET', /^\/api\/posts$/, listPosts],
  ['POST', /^\/api\/posts$/, createPost],
  ['PATCH', /^\/api\/posts\/([^/]+)\/status$/, changePostStatus],
  ['DELETE', /^\/api\/posts\/([^/]+)$/, deletePost],
  ['GET', /^\/api\/stats$/, getStats],
  ['GET', /^\/api\/activity$/, getActivity]
];

const server = http.createServer(withRequestLog(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = routes.find(([method, pattern]) => method === req.method && pattern.test(url.pathname));

  if (route) {
    const match = url.pathname.match(route[1]);
    await route[2](req, res, {url, params: match.slice(1)});
    return;
  }

  await serveStatic(url.pathname, res);
}));

async function listPosts(_req, res, {url}) {
  const posts = await postService.list(url.searchParams.get('summary') || 'short');
  sendJson(res, 200, posts);
}

async function createPost(req, res) {
  const input = await readJson(req);
  const command = new CreatePostCommand(postService, input);
  const post = await command.execute();
  sendJson(res, 201, post);
}

async function changePostStatus(req, res, {params}) {
  const input = await readJson(req);
  const command = new ChangeStatusCommand(postService, params[0], input.status);
  const post = await command.execute();

  if (!post) {
    sendJson(res, 404, {message: 'Post not found'});
    return;
  }

  sendJson(res, 200, post);
}

async function deletePost(_req, res, {params}) {
  const command = new DeletePostCommand(postService, params[0]);
  const deleted = await command.execute();

  if (!deleted) {
    sendJson(res, 404, {message: 'Post not found'});
    return;
  }

  sendJson(res, 204);
}

async function getStats(_req, res) {
  sendJson(res, 200, await postService.stats());
}

function getActivity(_req, res) {
  sendJson(res, 200, cms.getActivity());
}

async function serveStatic(pathname, res) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(frontendDir, requestedPath);
  const normalized = path.normalize(filePath);

  if (!normalized.startsWith(frontendDir)) {
    sendJson(res, 403, {message: 'Forbidden'});
    return;
  }

  try {
    const content = await fs.readFile(normalized);
    res.writeHead(200, {'Content-Type': contentType(normalized)});
    res.end(content);
  } catch {
    sendJson(res, 404, {message: 'Not found'});
  }
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {'Content-Type': 'application/json'});
  res.end(payload ? JSON.stringify(payload) : '');
}

function contentType(filePath) {
  const extension = path.extname(filePath);
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8'
  }[extension] || 'text/plain; charset=utf-8';
}

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Mini Ghost CMS running at http://localhost:${PORT}`);
  });
}

module.exports = {server};
