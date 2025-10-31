# Implementation Plan

## Project Overview
A collaborative todo list application with magic link authentication, list management, sharing, comments, and emoji reactions.

## Core Features

### ✅ Phase 1: Authentication (COMPLETED)
- Magic link email authentication with Resend
- Session management with JWT
- Protected routes and middleware

### ✅ Phase 2: Todo Management (COMPLETED)
- Create, read, update, delete todos
- Todo status: TODO, DOING, DONE, CANCELLED
- Assign todos to lists
- View todos in list or kanban mode

### ✅ Phase 3: List Management (COMPLETED)
- Create, read, update, delete lists
- Assign todos to lists
- View todos by list

### ✅ Phase 4: List Sharing (COMPLETED)
- Share lists with other users by email
- View shared lists
- Unshare lists
- Permissions: Users with shared access can view, create, update, and delete todos in shared lists

### ✅ Phase 5: Comments and Reactions (COMPLETED)
- Add comments to todos
- Delete own comments
- Add emoji reactions to todos
- Toggle reactions (add/remove)

### ✅ Phase 6: Kanban Board (COMPLETED)
- Drag-and-drop todos between status columns
- Filter by list
- View all todos in kanban mode

### ✅ Phase 7: Shared List Permissions (COMPLETED)
**Priority: CRITICAL BUG FIX**

**Issue**: Users could not see todos from lists shared with them. The `getTodos` function only fetched todos created by the current user.

**Solution Implemented**:
- Updated `getTodos` to fetch todos the user created OR from lists shared with them
- Updated `getTodo` to allow reading todos from shared lists
- Updated `updateTodo` to allow updating todos in shared lists (enables drag-and-drop in kanban for shared lists)
- Updated `deleteTodo` to allow deleting todos from shared lists

**Files Modified**:
- `src/app/actions/todos.ts`: Modified all CRUD functions to support shared list access

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 8: Due Dates (COMPLETED)
**Priority: HIGH - Essential todo app feature**

**Feature**: Add due date functionality to todos with visual indicators for overdue items.

**Implementation**:
- Added `dueDate` field to Todo model in Prisma schema
- Created and ran database migration
- Updated `CreateTodoInput` and `UpdateTodoInput` interfaces to support dueDate
- Updated `createTodo` and `updateTodo` actions to handle dueDate
- Added date picker to TodoForm component
- Updated TodoItem and KanbanCard components to display due dates
- Added visual indicators (⚠️ red text) for overdue todos
- Overdue status automatically respects DONE and CANCELLED statuses

**Files Modified**:
- `prisma/schema.prisma`: Added dueDate field to Todo model
- `src/app/actions/todos.ts`: Added dueDate support to interfaces and CRUD functions
- `src/components/todos/TodoForm.tsx`: Added date picker input
- `src/components/todos/TodoItem.tsx`: Added due date display with overdue indicators
- `src/components/todos/KanbanCard.tsx`: Added due date display with overdue indicators

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 9: Priority Levels (COMPLETED - Latest)
**Priority: HIGH - Fundamental todo app feature**

**Feature**: Add priority levels to todos with visual indicators (NONE, LOW, MEDIUM, HIGH, URGENT).

**Implementation**:
- Added `TodoPriority` enum to Prisma schema (NONE, LOW, MEDIUM, HIGH, URGENT)
- Added `priority` field to Todo model with default value NONE
- Created and ran database migration
- Updated `CreateTodoInput` and `UpdateTodoInput` interfaces to support priority
- Updated `createTodo` and `updateTodo` actions to handle priority
- Added priority selector dropdown to TodoForm component
- Updated TodoItem component with color-coded priority badges
- Updated KanbanCard component with color-coded priority badges
- Priority badges only display when priority is not NONE
- Color scheme: Blue (LOW), Yellow (MEDIUM), Orange (HIGH), Red (URGENT)

**Files Modified**:
- `prisma/schema.prisma`: Added TodoPriority enum and priority field to Todo model
- `src/app/actions/todos.ts`: Added priority support to interfaces and CRUD functions
- `src/components/todos/TodoForm.tsx`: Added priority selector dropdown
- `src/components/todos/TodoItem.tsx`: Added priority display with color-coded badges
- `src/components/todos/KanbanCard.tsx`: Added priority display with color-coded badges

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 10: Search and Advanced Filtering (COMPLETED - Latest)
**Priority: HIGH - Essential for todo management at scale**

**Feature**: Comprehensive search and filtering system to help users quickly find and organize their todos.

**Implementation**:
- Added text search functionality to search in todo titles and descriptions
- Added priority filter dropdown (All Priorities, Urgent, High, Medium, Low, None)
- Added due date filter dropdown (All, Overdue, Due Today, Due This Week, No Due Date)
- Updated `getTodos` server action to support all new filters
- Enhanced TodoList component with search bar and filter controls
- Enhanced KanbanBoard component with search bar and filter controls
- All filters work together (search + status + priority + due date + list)
- Real-time filtering as users type in search box
- Improved filter UI layout with responsive design

**Files Modified**:
- `src/app/actions/todos.ts`: Enhanced getTodos with search, priority, and dueDate filter support
- `src/components/todos/TodoList.tsx`: Added search input, priority filter, and due date filter
- `src/components/todos/KanbanBoard.tsx`: Added search input, priority filter, and due date filter

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 11: Notifications System (COMPLETED - Latest)
**Priority: HIGH - Critical collaboration feature**

**Feature**: Real-time notification system to alert users when others interact with shared lists and todos.

**Implementation**:
- Added `NotificationType` enum to Prisma schema (TODO_CREATED, TODO_UPDATED, TODO_DELETED, TODO_COMMENTED, TODO_REACTED, LIST_SHARED)
- Added `Notification` model with type, message, read status, references to user/todo/list/actor
- Created and ran database migration
- Created notification server functions in `src/lib/notifications-server.ts`:
  - `createNotification()` - Creates notification records
  - `getNotifications()` - Fetches user notifications with related data
  - `getUnreadCount()` - Counts unread notifications
  - `markAsRead()` - Marks single notification as read
  - `markAllAsRead()` - Marks all user notifications as read
- Added notification generation to todo actions (create/update/delete)
- Added notification generation to comment actions (create comment, add reaction)
- Added notification generation to list sharing (when list is shared)
- Created notification API endpoints:
  - `GET /api/notifications` - Fetch notifications
  - `PATCH /api/notifications` - Mark all as read
  - `PATCH /api/notifications/[id]` - Mark single notification as read
  - `GET /api/notifications/unread-count` - Get unread count
- Created notification UI components:
  - `NotificationBell` - Bell icon with unread count badge and dropdown
  - `NotificationList` - List of notifications with read/unread states
- Integrated NotificationBell into main page header
- Notifications only sent to shared list members (not the actor)
- Auto-refresh every 30 seconds for real-time updates
- Click to mark as read functionality
- Time ago formatting (e.g., "2m ago", "3h ago")

**Files Created**:
- `prisma/migrations/20251028190218_add_notifications/migration.sql`
- `src/lib/types/notifications.ts`
- `src/lib/notifications-server.ts`
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/[id]/route.ts`
- `src/app/api/notifications/unread-count/route.ts`
- `src/components/notifications/NotificationBell.tsx`
- `src/components/notifications/NotificationList.tsx`

**Files Modified**:
- `prisma/schema.prisma`: Added NotificationType enum, Notification model, inverse relations
- `src/app/actions/todos.ts`: Added notification creation to create/update/delete
- `src/app/actions/comments.ts`: Added notification creation to comments and reactions
- `src/app/actions/lists.ts`: Added notification creation to list sharing
- `src/app/page.tsx`: Integrated NotificationBell into header

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 12: Recurring Todos (COMPLETED - Latest)
**Priority: HIGH - Fundamental todo app feature**

**Feature**: Add recurring todos functionality to automatically generate new todo instances based on recurrence patterns (DAILY, WEEKLY, BIWEEKLY, MONTHLY).

**Implementation**:
- Added `RecurrencePattern` enum to Prisma schema (NONE, DAILY, WEEKLY, BIWEEKLY, MONTHLY)
- Added recurrence fields to Todo model: `recurrencePattern`, `recurrenceEndDate`, `parentRecurringTodoId`
- Created and ran database migration
- Created utility functions in `src/lib/recurrence.ts`:
  - `calculateNextDueDate()` - Calculates next due date based on pattern
  - `shouldCreateNextInstance()` - Checks if next instance should be created
  - `formatRecurrencePattern()` - Formats pattern for display
- Updated `CreateTodoInput` and `UpdateTodoInput` interfaces to support recurrence
- Updated `createTodo` and `updateTodo` actions to handle recurrence fields
- Added `createNextRecurringInstance()` function to auto-generate next instance when recurring todo is marked DONE or CANCELLED
- Next instance inherits: title, description, listId, priority, recurrence settings
- Updated TodoForm component with recurrence pattern selector and end date picker
- Updated TodoItem component with recurrence display (🔁 icon and pattern text)
- Updated KanbanCard component with recurrence display
- Recurrence end date stops generation after specified date
- Child instances tracked with `parentRecurringTodoId` for series relationship

**Files Created**:
- `prisma/migrations/20251028191557_add_recurring_todos/migration.sql`
- `src/lib/recurrence.ts`

**Files Modified**:
- `prisma/schema.prisma`: Added RecurrencePattern enum and recurrence fields to Todo model
- `src/app/actions/todos.ts`: Added recurrence support to interfaces, CRUD functions, and auto-generation logic
- `src/components/todos/TodoForm.tsx`: Added recurrence pattern selector and end date picker
- `src/components/todos/TodoItem.tsx`: Added recurrence display with indicators
- `src/components/todos/KanbanCard.tsx`: Added recurrence display with indicators

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 13: File Attachments (COMPLETED - Latest)
**Priority: HIGH - Fundamental todo app feature**

**Feature**: Add file attachment functionality to allow users to attach documents, images, and other files to todos.

**Implementation**:
- Added `Attachment` model to Prisma schema with fields for filename, filepath, mimetype, size
- Created and ran database migration for attachments
- Created attachment server functions in `src/lib/attachments-server.ts`:
  - `createAttachment()` - Uploads and saves file to local storage
  - `getAttachments()` - Fetches attachments for a todo
  - `getAttachment()` - Fetches single attachment by ID
  - `deleteAttachment()` - Deletes attachment file and database record
- Created attachment API endpoints:
  - `POST /api/attachments` - Upload file (max 10MB)
  - `GET /api/attachments?todoId=X` - List attachments for todo
  - `GET /api/attachments/[id]` - Download attachment file
  - `DELETE /api/attachments/[id]` - Delete attachment
- Created attachment UI components:
  - `FileUpload` - File input with upload progress and error handling
  - `AttachmentList` - Display list of attachments with download links and delete functionality
- Integrated attachments into TodoItem and KanbanCard components
- Added permission checks: only users with todo access (owner or shared list member) can view/upload/delete attachments
- Files stored locally in `/uploads` directory with sanitized filenames
- Added `/uploads` directory to .gitignore
- File size limit: 10MB per file
- Displays file type icons (🖼️ images, 📄 PDFs, 📎 other files)
- Shows file size in human-readable format (KB, MB)

**Files Created**:
- `prisma/migrations/20251028192204_add_attachments/migration.sql`
- `src/lib/types/attachments.ts`
- `src/lib/attachments-server.ts`
- `src/app/api/attachments/route.ts`
- `src/app/api/attachments/[id]/route.ts`
- `src/components/attachments/FileUpload.tsx`
- `src/components/attachments/AttachmentList.tsx`

**Files Modified**:
- `prisma/schema.prisma`: Added Attachment model and relations
- `src/components/todos/TodoItem.tsx`: Added FileUpload and AttachmentList
- `src/components/todos/KanbanCard.tsx`: Added FileUpload and AttachmentList
- `.gitignore`: Added /uploads directory

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 14: Keyboard Shortcuts (COMPLETED - Latest)
**Priority: HIGH - Essential productivity feature**

**Feature**: Add comprehensive keyboard shortcuts to improve productivity and user experience.

**Implementation**:
- Created custom React hook `useKeyboardShortcuts` for keyboard event handling
- Created `KeyboardShortcutsHelp` modal component to display available shortcuts
- Integrated keyboard shortcuts into TodoList component
- Integrated keyboard shortcuts into KanbanBoard component
- Added visual indicators (blue ring) for selected todos
- Shortcuts automatically disabled when typing in form fields
- Support for modifier keys (ctrl, alt, shift, meta)

**Keyboard Shortcuts Implemented**:
- **Navigation**: `j`/`↓` (next todo), `k`/`↑` (previous todo), `/` (focus search)
- **Actions**: `n`/`c` (new todo), `Enter` (edit selected), `d` (mark done), `x`/`Delete` (delete selected), `Escape` (close/cancel)
- **Help**: `?` (show keyboard shortcuts modal)

**Files Created**:
- `src/lib/hooks/useKeyboardShortcuts.ts`
- `src/components/common/KeyboardShortcutsHelp.tsx`

**Files Modified**:
- `src/components/todos/TodoList.tsx`: Added keyboard shortcuts integration
- `src/components/todos/KanbanBoard.tsx`: Added keyboard shortcuts integration
- `src/components/todos/TodoItem.tsx`: Added data-action attribute for keyboard navigation
- `src/components/todos/KanbanCard.tsx`: Added data-action attribute for keyboard navigation

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 15: Todo Templates (COMPLETED - Latest)
**Priority: HIGH - Essential productivity feature**

**Feature**: Add reusable todo templates to speed up todo creation for common tasks and workflows.

**Implementation**:
- Added `Template` model to Prisma schema with fields for name, title, description, priority, recurrencePattern
- Created and ran database migration for templates
- Created template server actions in `src/app/actions/templates.ts`:
  - `createTemplate()` - Creates new template
  - `getTemplates()` - Fetches user's templates
  - `getTemplate()` - Fetches single template
  - `updateTemplate()` - Updates existing template
  - `deleteTemplate()` - Deletes template
- Created template UI components:
  - `TemplateForm` - Create/edit template form with all template fields
  - `TemplateItem` - Display individual template with edit/delete actions
  - `TemplateManagement` - Template list management container
  - `TemplateSelector` - Dropdown selector for TodoForm
- Integrated TemplateSelector into TodoForm to prefill todo fields from template
- Added template management section to main page sidebar
- Templates are user-specific and sorted alphabetically by name
- When template is selected in TodoForm, it automatically fills in title, description, priority, and recurrence
- Template selector only appears when creating new todos (not when editing)

**Files Created**:
- `prisma/migrations/20251028193702_add_templates/migration.sql`
- `src/app/actions/templates.ts`
- `src/components/templates/TemplateForm.tsx`
- `src/components/templates/TemplateItem.tsx`
- `src/components/templates/TemplateManagement.tsx`
- `src/components/templates/TemplateSelector.tsx`

**Files Modified**:
- `prisma/schema.prisma`: Added Template model and relation to User
- `src/components/todos/TodoForm.tsx`: Added TemplateSelector and auto-fill logic
- `src/app/page.tsx`: Added TemplateManagement section to sidebar

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 16: Email Notifications (COMPLETED - Latest)
**Priority: HIGH - Critical collaboration feature**

**Feature**: Email notification system to alert users via email when others interact with shared lists and todos.

**Implementation**:
- Added `EmailNotificationFrequency` enum to Prisma schema (IMMEDIATE, NEVER)
- Added `emailNotificationFrequency` field to User model with default value IMMEDIATE
- Created and ran database migration for email preferences
- Created email notification templates in `src/lib/email-notifications.ts`:
  - HTML and text versions for all 6 notification types
  - Mobile-responsive design with inline CSS
  - Consistent styling with magic link template
- Enhanced `src/lib/email.ts` with notification email functions:
  - `getNotificationEmailTemplate()` - HTML email template
  - `getNotificationEmailText()` - Plain text version
  - `getNotificationEmailSubject()` - Subject line mapper
  - `sendNotificationEmail()` - Main sending function with preference checking
- Updated `src/lib/notifications-server.ts`:
  - Added `buildActionUrl()` helper to construct deep links to todos/lists
  - Modified `createNotification()` to send emails after creating notification
  - Email sending is non-blocking and respects user preferences
- Created server functions in `src/lib/notification-preferences-server.ts`:
  - `getNotificationPreferences()` - Fetch user's email preference
  - `updateNotificationPreferences()` - Update user's email preference
- Created API endpoint `src/app/api/settings/notification-preferences/route.ts`:
  - GET endpoint to fetch current preference
  - PATCH endpoint to update preference with validation
- Created UI component `src/components/settings/NotificationPreferences.tsx`:
  - Radio buttons for IMMEDIATE/NEVER preferences
  - Save functionality with success/error feedback
  - Consistent styling with app design
- Integrated NotificationPreferences into main page sidebar under Settings section
- Development mode logs emails to console instead of sending
- Only sends emails if user preference is IMMEDIATE
- Email sending failures don't prevent notification creation

**Files Created**:
- `prisma/migrations/20251028194458_add_email_notification_preferences/migration.sql`
- `src/lib/email-notifications.ts`
- `src/lib/notification-preferences-server.ts`
- `src/app/api/settings/notification-preferences/route.ts`
- `src/components/settings/NotificationPreferences.tsx`

**Files Modified**:
- `prisma/schema.prisma`: Added EmailNotificationFrequency enum and emailNotificationFrequency field
- `src/lib/email.ts`: Added notification email template and sending functions
- `src/lib/notifications-server.ts`: Integrated email sending into createNotification
- `src/app/page.tsx`: Added Settings section with NotificationPreferences component

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 17: Email Digest Notifications (COMPLETED - Latest)
**Priority: HIGH - Critical collaboration feature**

**Feature**: Email digest system allowing users to receive daily or weekly summaries of notifications instead of immediate individual emails.

**Implementation**:
- Extended `EmailNotificationFrequency` enum to add DAILY and WEEKLY options (now: IMMEDIATE, DAILY, WEEKLY, NEVER)
- Added `lastDigestSentAt` DateTime field to User model to track last digest send time
- Added `includedInDigest` Boolean field to Notification model to track digested notifications
- Created and ran database migration for digest support
- Created digest notification functions in `src/lib/digest-notifications-server.ts`:
  - `getUnsentDigestNotifications()` - Fetch notifications not yet included in digest
  - `markNotificationsAsDigested()` - Mark notifications as digested
  - `shouldSendDailyDigest()` - Check if 24+ hours since last digest
  - `shouldSendWeeklyDigest()` - Check if 7+ days since last digest
  - `updateLastDigestSentAt()` - Update user's last digest timestamp
  - `groupNotificationsByType()` - Group notifications for template rendering
- Created digest email templates in `src/lib/email-digests.ts`:
  - `getDigestEmailHtml()` - HTML template with grouped notifications and summary statistics
  - `getDigestEmailText()` - Plain text version of digest
  - `sendDigestEmail()` - Main function to send digest emails
  - Mobile-responsive design matching existing email templates
  - Summary statistics (e.g., "You have 5 new todos, 3 comments, 2 reactions")
- Created cron endpoint `src/app/api/cron/send-digests/route.ts`:
  - POST endpoint to process and send digests for all users
  - Checks user preferences and last digest send time
  - Sends digests only when notifications are available
  - Updates digest metadata after sending
  - Returns summary of digests sent
- Updated `src/components/settings/NotificationPreferences.tsx`:
  - Changed to support 4 frequency options (IMMEDIATE, DAILY, WEEKLY, NEVER)
  - Clear descriptions for each option
  - Fixed field name bug (preference → emailNotificationFrequency)
- Updated `src/app/api/settings/notification-preferences/route.ts`:
  - Validates all 4 frequency options
  - Improved type safety with VALID_FREQUENCIES constant
  - Better error messages
- Development mode logs digest emails to console
- Can be triggered via cron job or scheduled task

**Files Created**:
- `prisma/migrations/20251028195051_add_email_digests/migration.sql`
- `src/lib/digest-notifications-server.ts`
- `src/lib/email-digests.ts`
- `src/app/api/cron/send-digests/route.ts`

**Files Modified**:
- `prisma/schema.prisma`: Extended EmailNotificationFrequency enum, added User.lastDigestSentAt, added Notification.includedInDigest
- `src/components/settings/NotificationPreferences.tsx`: Updated to support 4 frequency options
- `src/app/api/settings/notification-preferences/route.ts`: Updated validation for new frequencies

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 18: Digest Customization (COMPLETED - Latest)
**Priority: HIGH - Enhance user control over notification preferences**

**Feature**: Allow users to customize which notification types are included in their daily or weekly email digests.

**Implementation**:
- Added 6 boolean fields to User model in Prisma schema for each notification type (all default to true):
  - `digestIncludeTodoCreated`, `digestIncludeTodoUpdated`, `digestIncludeTodoDeleted`
  - `digestIncludeTodoCommented`, `digestIncludeTodoReacted`, `digestIncludeListShared`
- Created and ran database migration for digest customization fields
- Updated `DigestCustomization` interface in notification-preferences-server.ts
- Enhanced `getNotificationPreferences()` to return digest customization preferences
- Enhanced `updateNotificationPreferences()` to accept and save digest customization
- Updated notification preferences API endpoints (GET/PATCH) to handle digest customization
- Updated digest cron job in `/api/cron/send-digests` to:
  - Fetch user digest customization preferences
  - Filter notifications based on user preferences before sending
  - Log filtered vs total notification counts
- Updated NotificationPreferences component with:
  - State management for digest customization checkboxes
  - Conditional UI display (only shows when frequency is DAILY or WEEKLY)
  - Six checkboxes for each notification type with clear labels
  - Integrated save functionality with frequency preferences
- User-friendly labels for each notification type
- All preferences saved together in a single API call
- Filtered notifications only marked as digested if sent

**Files Modified**:
- `prisma/schema.prisma`: Added 6 digest customization boolean fields to User model
- `src/lib/notification-preferences-server.ts`: Added DigestCustomization interface and updated functions
- `src/app/api/settings/notification-preferences/route.ts`: Updated GET and PATCH to handle digest customization
- `src/app/api/cron/send-digests/route.ts`: Added filtering logic based on user preferences
- `src/components/settings/NotificationPreferences.tsx`: Added digest customization UI with checkboxes

**Files Created**:
- `prisma/migrations/20251028200059_add_digest_customization/migration.sql`

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 19: Batch Operations for Todos (COMPLETED - Latest)
**Priority: HIGH - Essential productivity feature for managing multiple todos**

**Feature**: Add batch operations to allow users to select multiple todos and perform bulk actions (status updates, priority changes, move to list, delete).

**Implementation**:
- Added `BatchUpdateResult` and `BatchDeleteResult` interfaces to define batch operation return types
- Created `batchUpdateTodos()` server action to update multiple todos at once:
  - Validates input and checks permissions for each todo
  - Uses bulk update with `prisma.todo.updateMany()`
  - Handles recurring todo instances when status changes to DONE/CANCELLED
  - Sends consolidated notifications to list members
  - Returns count of updated todos and list of failed IDs
- Created `batchDeleteTodos()` server action to delete multiple todos:
  - Validates permissions for each todo
  - Uses bulk delete with `prisma.todo.deleteMany()`
  - Sends consolidated notifications before deletion
  - Returns count of deleted todos and list of failed IDs
- Created `BatchActionBar` component with:
  - Fixed position at bottom of screen with dark mode support
  - Selected count display
  - Dropdowns for status, priority, and list changes
  - Delete button with confirmation dialog
  - Loading state during batch operations
- Updated `TodoItem` component to support selection:
  - Added `showCheckbox`, `isSelected`, `onToggleSelection` props
  - Checkbox positioned at left side of todo item
  - Only visible when in batch mode
- Updated `TodoList` component with batch mode:
  - Batch mode toggle button
  - Selection state management with `Set<string>`
  - Handlers for all batch operations (status, priority, list, delete)
  - Select all and clear selection functionality
  - Integration with BatchActionBar component
- Updated `KanbanBoard` and `KanbanCard` components:
  - Same batch mode functionality as TodoList
  - Visual feedback with green ring on selected cards
  - Disabled drag-and-drop during batch mode
  - Hidden action buttons in batch mode

**Files Created**:
- `src/components/todos/BatchActionBar.tsx`

**Files Modified**:
- `src/app/actions/todos.ts`: Added batchUpdateTodos and batchDeleteTodos functions
- `src/components/todos/TodoItem.tsx`: Added checkbox selection support
- `src/components/todos/TodoList.tsx`: Added batch mode and operations
- `src/components/todos/KanbanBoard.tsx`: Added batch mode and operations
- `src/components/todos/KanbanCard.tsx`: Added selection support

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 20: Activity Log/Audit Trail (COMPLETED - Latest)
**Priority: HIGH - Essential for transparency and accountability in collaborative work**

**Feature**: Comprehensive activity log system to track all changes and actions performed on todos, lists, comments, and reactions.

**Implementation**:
- Added `ActivityType` enum to Prisma schema with 20+ activity types covering all user actions
- Added `ActivityLog` model with fields for activityType, description, metadata (JSON), userId, todoId, listId, createdAt
- Created and ran database migration for activity logs
- Created activity logging server functions in `src/lib/activity-log-server.ts`:
  - `createActivityLog()` - Creates activity log entries
  - `getActivityLogsForTodo()` - Fetches activity logs for a specific todo
  - `getActivityLogsForList()` - Fetches activity logs for a specific list
  - `getActivityLogsForUser()` - Fetches activity logs for a specific user
  - `getRecentActivityLogs()` - Fetches recent activity across all entities
- Integrated activity logging into all todo CRUD operations:
  - `TODO_CREATED` - When todos are created
  - `TODO_UPDATED` - When general fields are updated
  - `TODO_STATUS_CHANGED` - When status changes (with before/after values)
  - `TODO_PRIORITY_CHANGED` - When priority changes (with before/after values)
  - `TODO_ASSIGNED_TO_LIST` - When todo is first assigned to a list
  - `TODO_MOVED_TO_LIST` - When todo is moved between lists
  - `TODO_DELETED` - When todos are deleted
  - `BATCH_UPDATE` - When multiple todos are updated at once
  - `BATCH_DELETE` - When multiple todos are deleted at once
- Integrated activity logging into list operations:
  - `LIST_CREATED` - When lists are created
  - `LIST_UPDATED` - When list properties change (with before/after values)
  - `LIST_DELETED` - When lists are deleted
  - `LIST_SHARED` - When lists are shared with users
  - `LIST_UNSHARED` - When list sharing is revoked
- Integrated activity logging into comment and reaction operations:
  - `COMMENT_ADDED` - When comments are added to todos
  - `COMMENT_DELETED` - When comments are deleted
  - `REACTION_ADDED` - When emoji reactions are added
  - `REACTION_REMOVED` - When emoji reactions are removed
- Created API endpoint `GET /api/activity-logs`:
  - Supports filtering by todoId, listId, or returns user's activity
  - Supports limit parameter for pagination
  - Returns activity logs with user, todo, and list details
- Created `ActivityLogList` UI component:
  - Displays activity history in chronological order (newest first)
  - Shows activity icon, user name, description, and time ago
  - Responsive design with loading and empty states
  - Fetches and displays activity logs via API
- Integrated activity log viewer into TodoItem component:
  - Added "Show Activity" / "Hide Activity" toggle button
  - Displays activity log below comments section
  - Filtered to show only activities for that specific todo
- Integrated activity log viewer into ListItem component:
  - Added "Show Activity" / "Hide Activity" toggle button
  - Displays activity log below shared users section
  - Filtered to show only activities for that specific list
- Metadata stored as JSON for rich activity descriptions
- Activity logs cascade delete with related entities (todos, lists)
- Permission-based access: users can only see activity logs for todos/lists they have access to

**Files Created**:
- `prisma/migrations/20251028201814_add_activity_log/migration.sql`
- `src/lib/activity-log-server.ts`
- `src/app/api/activity-logs/route.ts`
- `src/components/activity-logs/ActivityLogList.tsx`

**Files Modified**:
- `prisma/schema.prisma`: Added ActivityType enum, ActivityLog model, and relations
- `src/app/actions/todos.ts`: Added activity logging to all CRUD and batch operations
- `src/app/actions/lists.ts`: Added activity logging to all list operations
- `src/app/actions/comments.ts`: Added activity logging to comment and reaction operations
- `src/components/todos/TodoItem.tsx`: Added activity log viewer integration
- `src/components/lists/ListItem.tsx`: Added activity log viewer integration

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 21: Custom Recurrence Patterns (COMPLETED - Latest)
**Priority: HIGH - Essential enhancement to recurring todos**

**Feature**: Advanced custom recurrence patterns allowing users to create more sophisticated repeating todo schedules beyond simple daily, weekly, and monthly patterns.

**Implementation**:
- Extended `RecurrenceType` enum in Prisma schema (SIMPLE, INTERVAL, WEEKDAYS, MONTHDAY, COMPLEX)
- Added custom recurrence fields to Todo and Template models:
  - `recurrenceInterval` - For "every N days/weeks/months" patterns
  - `recurrenceDaysOfWeek` - For specific days of week (e.g., "Mon, Wed, Fri")
  - `recurrenceDayOfMonth` - For specific day of month (e.g., 15th of every month)
  - `recurrenceWeekOfMonth` - For week ordinal in month (1st, 2nd, 3rd, 4th, Last)
  - `recurrenceMonthDay` - For weekday in COMPLEX patterns (e.g., "first Monday")
- Created and ran database migration for custom recurrence fields
- Enhanced `calculateNextDueDate()` function in recurrence.ts to support all recurrence types:
  - SIMPLE: Default behavior (daily, weekly, biweekly, monthly)
  - INTERVAL: Every N units (e.g., every 3 days, every 2 weeks)
  - WEEKDAYS: Specific days of week (e.g., Monday, Wednesday, Friday)
  - MONTHDAY: Specific day of month with overflow handling (e.g., 31st → last day)
  - COMPLEX: Advanced patterns (e.g., "first Monday", "last Friday", "third Thursday")
- Added `formatCustomRecurrence()` function for human-readable recurrence descriptions
- Updated `createNextRecurringInstance()` to pass all recurrence fields
- Enhanced TodoForm component with comprehensive custom recurrence UI:
  - Recurrence type selector (conditional based on pattern)
  - Interval input for INTERVAL type
  - Day of week checkboxes for WEEKDAYS type
  - Day of month input for MONTHDAY type
  - Week ordinal and weekday selectors for COMPLEX type
- Enhanced TemplateForm component with identical custom recurrence UI
- Updated TodoItem and KanbanCard to display formatted custom recurrence descriptions
- Updated templates actions to support all new recurrence fields
- All recurrence fields properly handled in create and update operations

**Custom Recurrence Examples**:
- Every 3 days
- Every 2 weeks
- Monday, Wednesday, Friday each week
- 15th of every month
- Last day of every month
- First Monday of every month
- Third Thursday of every month
- Last Friday of every month

**Files Created**:
- `prisma/migrations/20251028203200_add_custom_recurrence_patterns/migration.sql`

**Files Modified**:
- `prisma/schema.prisma`: Added RecurrenceType enum and custom recurrence fields to Todo and Template
- `src/lib/recurrence.ts`: Enhanced calculateNextDueDate and added formatCustomRecurrence
- `src/app/actions/todos.ts`: Updated interfaces and functions to support custom recurrence fields
- `src/app/actions/templates.ts`: Updated to support custom recurrence fields (already had types, no changes needed)
- `src/components/todos/TodoForm.tsx`: Added comprehensive custom recurrence UI
- `src/components/templates/TemplateForm.tsx`: Added comprehensive custom recurrence UI
- `src/components/todos/TodoItem.tsx`: Updated to use formatCustomRecurrence
- `src/components/todos/KanbanCard.tsx`: Updated to use formatCustomRecurrence

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 22: Todo Dependencies (COMPLETED - Latest)
**Priority: HIGH - Essential project management feature**

**Feature**: Add todo dependency system to track blocking and blocked-by relationships between todos, enabling complex workflow management.

**Implementation**:
- Added `TodoDependency` junction model to Prisma schema for many-to-many self-relation
- Added `blockedBy` and `blocking` relations to Todo model
- Extended `ActivityType` enum with DEPENDENCY_ADDED and DEPENDENCY_REMOVED
- Created and ran database migration for todo dependencies
- Created dependency management server actions in `src/app/actions/todos.ts`:
  - `addTodoDependency()` - Add dependency with validation and duplicate prevention
  - `removeTodoDependency()` - Remove dependency with permission checks
  - `getTodoDependencies()` - Fetch all dependencies (blockedBy and blocking)
- Activity logging for all dependency operations with metadata
- Notifications sent to todo owners and list members for dependency changes
- Created dependency UI components:
  - `DependencySelector` - Dropdown to select and add dependencies
  - `DependencyList` - Display blocked-by and blocking relationships
- Visual indicators:
  - 🚧 Blocked By section with yellow/green badges (green when blocker is completed)
  - ⛔ Blocking section with blue badges showing dependent todos
  - Status badges showing completion state of dependencies
- Integrated dependency management into TodoItem and KanbanCard components
- Toggle button to show/hide dependencies section
- Permission-based access: only users with todo access can manage dependencies
- Self-dependency prevention: todos cannot depend on themselves
- Cascade delete: dependencies automatically removed when todos are deleted

**Files Created**:
- `prisma/migrations/20251029150838_add_todo_dependencies/migration.sql`
- `src/components/dependencies/DependencySelector.tsx`
- `src/components/dependencies/DependencyList.tsx`

**Files Modified**:
- `prisma/schema.prisma`: Added ActivityType values, TodoDependency model, relations to Todo
- `src/app/actions/todos.ts`: Added dependency management functions with activity logging and notifications
- `src/components/todos/TodoItem.tsx`: Added dependency section with selector and list
- `src/components/todos/KanbanCard.tsx`: Added dependency section with selector and list

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 23: Circular Dependency Detection (COMPLETED - Latest)
**Priority: CRITICAL - Bug prevention for dependency system**

**Feature**: Implement circular dependency detection to prevent users from creating invalid dependency chains that loop back on themselves.

**Implementation**:
- Created `detectCircularDependency()` helper function using depth-first search (DFS) algorithm
- Algorithm traverses dependency graph starting from `dependsOnTodoId` to check if it can reach `todoId`
- Uses iterative approach with stack-based traversal and visited set for optimization
- Integrated validation into `addTodoDependency()` action before creating dependency
- Returns clear error message: "Cannot add dependency: This would create a circular dependency chain"
- Prevents invalid dependency scenarios such as:
  - Todo A depends on Todo B
  - Todo B depends on Todo C
  - Todo C depends on Todo A (circular - now blocked)
- UI already handles and displays error messages to users via DependencySelector component
- Validation runs after self-dependency check and before database insertion

**Files Modified**:
- `src/app/actions/todos.ts`: Added detectCircularDependency() function and validation in addTodoDependency()

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

### ✅ Phase 24: Dependency Visualization (Graph View) (COMPLETED - Latest)
**Priority: HIGH - Critical for understanding complex dependency relationships**

**Feature**: Interactive dependency graph visualization to help users understand and navigate complex todo dependency chains.

**Implementation**:
- Researched and selected ReactFlow as the optimal graph visualization library for React/Next.js
- Installed `@xyflow/react` and `@dagrejs/dagre` for graph rendering and hierarchical layout
- Created `getDependencyGraph()` server action in todos.ts to fetch all todos with their dependencies
- Added support for filtering graph by list, status, and priority
- Created `TodoNodeData` interface extending `Record<string, unknown>` for type compatibility
- Created custom `TodoNode` component with:
  - Status-based color coding (Gray=TODO, Blue=DOING, Green=DONE, Red=CANCELLED)
  - Priority badges (Low, Medium, High, Urgent) with color indicators
  - Due date display with overdue warnings (⚠️ red text)
  - List name and user attribution
  - Drag handles for repositioning
- Created `GraphView` component with comprehensive features:
  - Automatic hierarchical layout using dagre algorithm
  - Interactive zoom, pan, and drag controls
  - Filter dropdowns for list, status, and priority
  - Re-layout button to reset graph positioning
  - Node and edge count statistics
  - Empty state messaging
  - Animated edges showing dependency flow
  - Mini-map for navigation in large graphs
  - Background grid with dots pattern
- Created `GraphViewWrapper` component to provide ReactFlowProvider context
- Integrated graph view into main page with new "Graph" view mode button
- Added view mode state management alongside existing "List" and "Kanban" modes
- Fetches lists data for filter dropdown population
- Edge rendering shows dependencies as arrows pointing from blocker to blocked todos
- Help section with usage instructions for keyboard/mouse controls
- Responsive design with dark mode support throughout
- Performance optimized with React.memo for TodoNode component

**Key Features**:
- **Interactive Navigation**: Drag nodes, zoom in/out, pan across large graphs
- **Smart Filtering**: Filter graph by specific lists, statuses, or priorities
- **Visual Indicators**: Color-coded nodes by status, priority badges, overdue warnings
- **Layout Controls**: Automatic hierarchical layout with manual re-layout option
- **Mini-Map**: Overview panel for navigating complex dependency trees
- **Responsive Design**: Works in light and dark modes with consistent styling
- **Real-time Data**: Fetches latest todos and dependencies via server actions

**Files Created**:
- `src/components/graph/TodoNode.tsx` - Custom node component for todos
- `src/components/graph/GraphView.tsx` - Main graph visualization component
- `src/components/graph/GraphViewWrapper.tsx` - ReactFlow provider wrapper

**Files Modified**:
- `src/app/actions/todos.ts`: Added TodoNodeData interface, DependencyGraphData interface, and getDependencyGraph() function
- `src/app/page.tsx`: Added graph view mode, lists state management, GraphViewWrapper integration
- `package.json`: Added @xyflow/react and @dagrejs/dagre dependencies

**Dependencies Added**:
- `@xyflow/react@^12.9.0` - React Flow library for node-based UI
- `@dagrejs/dagre@^1.1.4` - Dagre layout algorithm for hierarchical graphs

**Testing**:
- ✅ Linter passed
- ✅ Build succeeded
- ✅ No type errors

## Next Steps

All core features completed including dependency visualization. Potential future enhancements:
- Add cloud storage integration for attachments (S3, GCS, etc.)
- Add template sharing between users
- Add batch operations for comments (bulk delete comments)
- Add activity log export functionality (CSV, JSON)
- Add click-to-navigate from graph nodes to todo details
- Add dependency path highlighting (show full chain when selecting a node)
- Add graph export functionality (PNG, SVG, PDF)
