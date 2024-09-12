interface Notification {
  category:
    | 'General'
    | 'SprintCreation'
    | 'SprintDeadline'
    | 'TaskAssignment'
    | 'UserMention';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// TODO: Further to update categories of notifications based on usecases.
