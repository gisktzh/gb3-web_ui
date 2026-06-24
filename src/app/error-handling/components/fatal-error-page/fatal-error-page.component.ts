import {Component, computed, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'fatal-error-page',
  templateUrl: './fatal-error-page.component.html',
  styleUrls: ['./fatal-error-page.component.scss'],
  imports: [MatIcon, MatButton],
})
export class FatalErrorPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly queryParamMap = toSignal(this.route.queryParamMap);
  public readonly errorMessage = computed(() => this.queryParamMap()?.get('error'));

  public forceRefresh() {
    window.location.href = '/';
  }
}
