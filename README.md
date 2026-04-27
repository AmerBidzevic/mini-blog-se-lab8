# Ghost Lab Mini CMS

A Ghost-inspired mini blog/CMS built for Software Engineering Lab 8.

I analyzed Ghost in Labs 5-7 (category: CMS / publishing platform). I am building Ghost Lab Mini CMS, which belongs to the same category.

## Tech Stack

- Backend: Node.js built-in HTTP server
- Frontend: HTML, CSS, and vanilla JavaScript
- Persistence: JSON file on disk in `backend/data/posts.json`
- Tests: Node.js built-in test runner

## Features

- List blog posts with selectable summary modes.
- Create draft or published posts.
- Publish, archive, and delete posts.
- View CMS statistics and recent activity.

## Running Locally

```bash
npm start
```

Open `http://localhost:3000`.

Run tests:

```bash
npm test
```

## API Endpoints

- `GET /api/posts?summary=short|reading|editorial`
- `POST /api/posts`
- `PATCH /api/posts/:id/status`
- `DELETE /api/posts/:id`
- `GET /api/stats`
- `GET /api/activity`

## Patterns Applied

### Builder

- Files/classes: `backend/patterns/PostBuilder.js`, `PostBuilder`
- Category: Creational
- Why: My Ghost analysis found that post creation logic can become too large and conditional inside the model. The builder centralizes title, slug, content, status, author, and tag construction so creating a post stays readable.

### Decorator

- Files/classes: `backend/patterns/withRequestLog.js`, `withRequestLog`
- Category: Structural
- Why: My Lab 7 analysis pointed out repeated middleware wrapper logic in Ghost's spam-prevention area. This decorator wraps any route handler with request logging without copying that wrapper code into every endpoint.

### Facade

- Files/classes: `backend/services/CmsFacade.js`, `CmsFacade`
- Category: Structural
- Why: The facade hides setup of the repository, service, event bus, and activity log behind one simple CMS entry point, similar to how Ghost uses service facades for complex publishing subsystems.

### Command

- Files/classes: `backend/patterns/PostCommand.js`, `CreatePostCommand`, `DeletePostCommand`, `ChangeStatusCommand`
- Category: Behavioral
- Why: My Lab 7 work identified command objects as useful for request behavior that would otherwise be hardcoded. Here, create, delete, and status-change actions are encapsulated as command classes.

### Strategy

- Files/classes: `backend/patterns/PostSummaryStrategy.js`, `ShortSummaryStrategy`, `ReadingTimeSummaryStrategy`, `EditorialSummaryStrategy`
- Category: Behavioral
- Why: The frontend can switch between different post summary algorithms without changing the post listing code, reflecting the same flexibility I discussed around Ghost's content rendering strategies.

### Observer

- Files/classes: `backend/patterns/EventBus.js`, `EventBus`; `backend/services/CmsFacade.js`
- Category: Behavioral
- Why: Post creation, deletion, and status changes emit events that update activity history. This keeps the post service from directly knowing which side effects should happen after publishing actions.

## Deployment

Deployment is optional for the assignment. A live URL can be added here if the project is deployed later.
