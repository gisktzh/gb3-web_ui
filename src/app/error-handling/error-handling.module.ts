import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotFoundErrorPageComponent} from './components/not-found-error-page/not-found-error-page.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [NotFoundErrorPageComponent],
  imports: [CommonModule, SharedModule],
})
export class ErrorHandlingModule {}
