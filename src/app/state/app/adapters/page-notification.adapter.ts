import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {PageNotification} from '../../../shared/interfaces/page-notification.interface';

export const PageNotificationAdapter: EntityAdapter<PageNotification> = createEntityAdapter<PageNotification>({});
