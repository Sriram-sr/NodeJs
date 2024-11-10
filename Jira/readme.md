# Data Models

## 1. User

- **email**: String (unique)
- **password**: String (hashed)
- **Notifications**: [Notification]

## 2. Project

- **title**: String
- **description**: String
- **creator**: ObjectId (references User)
- **members**: [ObjectId] (array of User IDs)
- **Requests**: Array of { requester: '', reason: '' }
- **Sprints**: []

## 3. Task

- **title**: String
- **description**: String
- **status**: String (enum: [To Do, In Progress, In Review, Done])
- **priority**: String (enum: [High, Medium, Low])
- **dueDate**: Date
- **project**: ObjectId (references Project)
- **SprintID**: which sprint task belongs to
- **assignee**: ObjectId (references User)
- **comments**: [ObjectId] (array of Comment IDs)

## 4. Comment

- **user**: ObjectId (references User)
- **taskId**: <>
- **content**: String

## 5. Sprint

- **Name**: String
- **StartDate**: Date
- **EndDate**: Date
- **Goals**: String
- **ProjectID**: ObjectId (foreign key to Project)
- **Tasks**: [ObjectId] (array of Task IDs)

## 6. Notification (Embedded Schema)

- **Category**: enum
- TaskAssignment
- TaskStatusChange
- TaskPriorityChange
- TaskDueDateChange
- TaskComment
- UserMention
- SprintStartEnd
- SprintDeadLine
- General
- **isRead**: Boolean
- **Message**: String
- **createdAt**: Date

| Category              | Feature                        | Endpoint                                         | Status | Method         | Comments                                                                                                                                                                        |
| --------------------- | ------------------------------ | ------------------------------------------------ | ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth(/auth)**       | Register user                  | /auth/signup                                     | TODO   | POST           |                                                                                                                                                                                 |
| Auth                  | Login user                     | /auth/signin                                     | TODO   | POST           | Notification delete logic is pending.                                                                                                                                           |
| Auth                  | Forgot password                | /auth/forgot-password                            | TODO   | POST           |                                                                                                                                                                                 |
| Auth                  | Reset password                 | /auth/reset-password                             | TODO   | POST           |                                                                                                                                                                                 |
| Auth                  | Get user profile               | /auth/user/                                      | TODO   | GET            | User's projects, sprint details can be shown in the profile page.                                                                                                               |
| Auth                  | Get all users                  | /auth/users                                      | TODO   | GET            |                                                                                                                                                                                 |
| Auth                  | Get notifications for user     | /auth/user/notifications                         | TODO   | GET            |                                                                                                                                                                                 |
| Auth                  | Get user's projects            | /auth/user/projects                              | TODO   | GET            |                                                                                                                                                                                 |
| **Project(/project)** | Create Project                 | /project/                                        | TODO   | POST, GET      | Get project to be implemented with different filters. POST is done.                                                                                                             |
| Project               | Single project routes          | /project/:projectCode/                           | TODO   | GET/PUT/DELETE | PUT - Project creator to set inactive to take care(Remove project from each member's active projects).                                                                          |
| Project               | Add project member             | /project/:projectCode/add-member/:memberId       | TODO   | POST           |                                                                                                                                                                                 |
| Project               | Remove project member          | /project/:projectCode/remove-member/:memberId    | TODO   | DELETE         |                                                                                                                                                                                 |
| Project               | Request to join a project      | /project/:projectCode/request/                   | TODO   | GET/POST       |                                                                                                                                                                                 |
| Project               | Approve/Decline a join request | /project/:projectCode/request/:requestId/process | Done   | PUT            |                                                                                                                                                                                 |
| Project               | Create a sprint/get sprints    | /project/:projectCode/sprint                     | TODO   | GET/POST       | Get all project sprints is pending. (Can plan if sprint can be accomplished with project view page itself)                                                                      |
| Project               | Single sprint routes           | /project/:projectCode/sprint/:sprintId           | TODO   | GET/PUT/DELETE | Update route to take care of notifications for deadlines. GET - If sprint deadline is close, send notification to members.                                                      |
| Project               | Get tasks per sprint           | /project/:projectCode/sprint/:sprintId/tasks     | TODO   | GET            |                                                                                                                                                                                 |
| Project               | Get tasks for a project        | /project/:projectCode/task                       | TODO   | GET            |                                                                                                                                                                                 |
| **Task**              | Create a task                  | /task/                                           | TODO   | GET/POST       | POST task is done. Get will work with random Tasks(with filters) Should not show Private project tasks. POST(Create task) is done. POST task should check members only to post. |
| Task                  | Single task routes             | /task/:taskId                                    | TODO   | GET/PUT/DELETE | Update route should include notifications properly. Delete - Task comments should be deleted once task deleted.                                                                 |
| Task                  | Comment on a task              | /task/:taskId/comment                            | TODO   | GET/POST       | User mention notification to take care.                                                                                                                                         |
| Task                  | Assign a task                  | /task/:taskId/assign                             | TODO   | PATCH          | Add assigned task id to user collection                                                                                                                                         |
| Task                  | Unassign a task                | /task/:taskId/unassign                           | TODO   | DELETE         |                                                                                                                                                                                 |
| Task                  | Delete a comment               | /task/:taskId/comment/:commentId                 | TODO   | DELETE         | Delete the comment in comments collection itself.                                                                                                                               |
