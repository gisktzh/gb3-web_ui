import {PageNotification} from '../../../shared/interfaces/page-notification.interface';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {EntityState} from '@ngrx/entity';

export interface PageNotificationState extends HasLoadingState, EntityState<PageNotification> {}
