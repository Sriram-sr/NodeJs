Endpoints

Auth:

POST /api/v1/auth/signup: Registers a user.✅
POST /api/v1/auth/signin: Logins a user.✅

Label:

GET /api/v1/label: Gets all labels.✅
POST /api/v1/label: Creates a label.✅
GET /api/v1/label/:labelId: Gets single label.✅
PATCH /api/v1/label/:labelId: Updates a label.✅
DELETE /api/v1/label/:labelId: Deletes a label.✅

Task:

GET /api/v1/task/: Gets all tasks.✅
POST /api/v1/task/: Creates a task.✅
GET /api/v1/task/:taskId: Gets single task.✅
POST /api/v1/task/:taskId/assign: Assigns a task.✅
DELETE /api/v1/task/:taskId/unassign: Unassigns a task.✅
POST /api/v1/task/:taskId/collaborator: Adds a user as a collaborator.✅
DELETE /api/v1/task/:taskId/collaborator: Removes user as a collaborator.✅
POST /api/v1/task/:taskId/comment: Adds comment in a task.✅
PATCH /api/v1/task/:taskId/label/:labeId: Adds new label to task.✅
DELETE /api/v1/task/:taskId/label/:labelId: Removes label from task.✅
PATCH /api/v1/task/status/:taskId: Updates status of a task.✅
