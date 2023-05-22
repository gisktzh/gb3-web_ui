import {MainPage} from '../enums/main-page.enum';
import {HasMarkedAsReadState} from './has-marked-as-read-state.interface';

export interface PageNotification extends HasMarkedAsReadState {
  id: string;
  title: string;
  description: string;
  pages: MainPage[];
  fromDate: Date;
  toDate: Date;
  severity: PageNotificationSeverity;
}

export type PageNotificationSeverity = 'info' | 'warning';
