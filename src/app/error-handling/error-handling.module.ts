import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotFoundErrorPageComponent} from './components/not-found-error-page/not-found-error-page.component';
import {SharedModule} from '../shared/shared.module';
import {FatalErrorPageComponent} from './components/fatal-error-page/fatal-error-page.component';
import {RouterModule} from '@angular/router';
import {ErrorNotificationComponent} from './components/error-notification/error-notification.component';

@NgModule({
  imports: [CommonModule, SharedModule, RouterModule, NotFoundErrorPageComponent, FatalErrorPageComponent, ErrorNotificationComponent],
})
export class ErrorHandlingModule {}
