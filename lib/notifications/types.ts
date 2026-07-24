export interface NotificationItem {
  id: string;
  type: string;
  text: string;
  leadId: string | null;
  createdAt: Date;
}
