import {MainPage} from '../enums/main-page.enum';

export interface PageNotification {
  id: string;
  title: string;
  description: string;
  pages: MainPage[];
  fromDate: Date;
  toDate: Date;
  severity: PageNotificationSeverity;
}

export type PageNotificationSeverity = 'info' | 'warning';
