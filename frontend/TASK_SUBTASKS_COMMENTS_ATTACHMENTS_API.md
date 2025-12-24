# Task Subtasks, Comments, and Attachments API

## ✅ Added API Endpoints

### Subtasks
- `POST /tasks/:uid/subtasks` - Add a subtask to a task
- `PATCH /tasks/:uid/subtasks/:subtaskId` - Update a subtask
- `DELETE /tasks/:uid/subtasks/:subtaskId` - Delete a subtask

### Comments
- `POST /tasks/:uid/comments` - Add a comment to a task
- `PATCH /tasks/:uid/comments/:commentId` - Update a comment
- `DELETE /tasks/:uid/comments/:commentId` - Delete a comment

### Attachments
- `POST /tasks/:uid/attachments` - Upload an attachment (multipart/form-data)
- `DELETE /tasks/:uid/attachments/:attachmentId` - Delete an attachment
- `GET /tasks/:uid/attachments/:attachmentId/download` - Download an attachment

## ✅ Updated Files

### API Endpoints (`src/core/config/api-endpoints.ts`)
- Added `TASKS.SUBTASKS`, `TASKS.ADD_SUBTASK`, `TASKS.UPDATE_SUBTASK`, `TASKS.DELETE_SUBTASK`
- Added `TASKS.COMMENTS`, `TASKS.ADD_COMMENT`, `TASKS.UPDATE_COMMENT`, `TASKS.DELETE_COMMENT`
- Added `TASKS.ATTACHMENTS`, `TASKS.UPLOAD_ATTACHMENT`, `TASKS.DELETE_ATTACHMENT`, `TASKS.DOWNLOAD_ATTACHMENT`

### API Service (`src/core/services/api.ts`)
- Added `addSubtask(uid, subtask)` method
- Added `updateSubtask(uid, subtaskId, subtask)` method
- Added `deleteSubtask(uid, subtaskId)` method
- Added `addComment(uid, comment)` method
- Added `updateComment(uid, commentId, comment)` method
- Added `deleteComment(uid, commentId)` method
- Added `uploadAttachment(uid, file)` method (supports FormData)
- Added `deleteAttachment(uid, attachmentId)` method
- Added `downloadAttachment(uid, attachmentId)` method (returns Blob)
- Updated `post()` method to support custom headers (for FormData)
- Updated `get()` method to support blob response type
- Added `Comment` import

### API Helpers (`src/core/services/api-helpers.ts`)
- Added `taskApi.addSubtask()` helper
- Added `taskApi.updateSubtask()` helper
- Added `taskApi.deleteSubtask()` helper
- Added `taskApi.addComment()` helper
- Added `taskApi.updateComment()` helper
- Added `taskApi.deleteComment()` helper
- Added `taskApi.uploadAttachment()` helper
- Added `taskApi.deleteAttachment()` helper
- Added `taskApi.downloadAttachment()` helper
- Added `Comment` import

## 📝 Usage Examples

### Subtasks

```typescript
import { taskApi } from "@/core/services/api-helpers";

// Add a subtask
const newSubtask = await taskApi.addSubtask(taskUid, { title: "Complete subtask" });

// Update a subtask
const updatedSubtask = await taskApi.updateSubtask(taskUid, subtaskId, { 
  completed: true 
});

// Delete a subtask
await taskApi.deleteSubtask(taskUid, subtaskId);
```

### Comments

```typescript
import { taskApi } from "@/core/services/api-helpers";

// Add a comment
const newComment = await taskApi.addComment(taskUid, { text: "This looks good!" });

// Update a comment
const updatedComment = await taskApi.updateComment(taskUid, commentId, { 
  text: "Updated comment text" 
});

// Delete a comment
await taskApi.deleteComment(taskUid, commentId);
```

### Attachments

```typescript
import { taskApi } from "@/core/services/api-helpers";

// Upload an attachment
const file = event.target.files[0];
const attachment = await taskApi.uploadAttachment(taskUid, file);
// Returns: { id, name, url, size, type }

// Delete an attachment
await taskApi.deleteAttachment(taskUid, attachmentId);

// Download an attachment
const blob = await taskApi.downloadAttachment(taskUid, attachmentId);
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "filename";
a.click();
URL.revokeObjectURL(url);
```

## 🔄 Integration with Task Detail Modal

The Task Detail Modal can now use these API methods instead of just updating local state. Here's how to integrate:

```typescript
import { taskApi } from "@/core/services/api-helpers";
import { toast } from "sonner";

// In your component using TaskDetailModal
const handleTaskUpdate = async (updatedTask: Task) => {
  try {
    // Update the main task
    await taskApi.update(updatedTask.uid, {
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      assignees: updatedTask.assignees,
      dueDate: updatedTask.dueDate,
      startDate: updatedTask.startDate,
      estimatedCost: updatedTask.estimatedCost,
      attachments: updatedTask.attachments, // Count only
    });
    
    // Note: Subtasks and comments are updated separately via their own endpoints
    // The modal should call these endpoints directly when adding/updating/deleting
    
    toast.success("Task updated successfully");
  } catch (error) {
    toast.error("Failed to update task");
  }
};

// For subtasks - call directly from modal handlers
const handleAddSubtask = async (taskUid: string, title: string) => {
  try {
    const newSubtask = await taskApi.addSubtask(taskUid, { title });
    // Update local task state with new subtask
    return newSubtask;
  } catch (error) {
    toast.error("Failed to add subtask");
  }
};

// For comments - call directly from modal handlers
const handleAddComment = async (taskUid: string, text: string) => {
  try {
    const newComment = await taskApi.addComment(taskUid, { text });
    // Update local task state with new comment
    return newComment;
  } catch (error) {
    toast.error("Failed to add comment");
  }
};

// For attachments - call directly from modal handlers
const handleUploadAttachment = async (taskUid: string, file: File) => {
  try {
    const attachment = await taskApi.uploadAttachment(taskUid, file);
    // Update local task state with new attachment
    return attachment;
  } catch (error) {
    toast.error("Failed to upload attachment");
  }
};
```

## 📋 API Request/Response Formats

### Add Subtask
**Request:**
```json
POST /tasks/:uid/subtasks
{
  "title": "Subtask title"
}
```

**Response:**
```json
{
  "id": "subtask-id",
  "title": "Subtask title",
  "completed": false
}
```

### Add Comment
**Request:**
```json
POST /tasks/:uid/comments
{
  "text": "Comment text"
}
```

**Response:**
```json
{
  "id": "comment-id",
  "text": "Comment text",
  "author": "User Name",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Upload Attachment
**Request:**
```
POST /tasks/:uid/attachments
Content-Type: multipart/form-data

file: [binary file data]
```

**Response:**
```json
{
  "id": "attachment-id",
  "name": "filename.pdf",
  "url": "https://example.com/attachments/attachment-id",
  "size": 1024,
  "type": "application/pdf"
}
```

## Summary

✅ **Completed:**
- All subtask endpoints (add, update, delete)
- All comment endpoints (add, update, delete)
- All attachment endpoints (upload, delete, download)
- API service methods with FormData support
- API helpers with mock fallback
- Proper TypeScript types

📝 **Next Steps:**
- Update TaskDetailModal to use these API methods directly
- Add loading states for async operations
- Add error handling and user feedback
- Update task state after successful operations


