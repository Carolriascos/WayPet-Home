export type Notification = {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  match?: { id: number };
};