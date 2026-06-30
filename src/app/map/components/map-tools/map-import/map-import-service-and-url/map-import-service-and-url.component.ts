import {Component, computed, effect, inject, signal} from '@angular/core';
import {MapServiceType} from '../../../../types/map-service.type';
import {Store} from '@ngrx/store';
import {SharedModule} from '../../../../../shared/shared.module';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {selectLoadingState} from '../../../../../state/map/reducers/external-map-item.reducer';
import {selectServiceType, selectUrl} from '../../../../../state/map/reducers/map-import.reducer';
import {ExternalMapItemActions} from '../../../../../state/map/actions/external-map-item.actions';
import {form, required, validate, FormField, disabled, FormRoot} from '@angular/forms/signals';

@Component({
  selector: 'map-import-service-and-url',
  imports: [SharedModule, FormField, FormRoot],
  templateUrl: './map-import-service-and-url.component.html',
  styleUrl: './map-import-service-and-url.component.scss',
})
export class MapImportServiceAndUrlComponent {
  private readonly store = inject(Store);

  public readonly loadingState = this.store.selectSignal(selectLoadingState);
  public readonly serviceType = this.store.selectSignal(selectServiceType);
  public readonly url = this.store.selectSignal(selectUrl);
  public readonly serviceAndUrlModel = signal<{
    serviceType: MapServiceType | null;
    url: string;
  }>({
    serviceType: null,
    url: '',
  });
  public serviceAndUrlForm = form(
    this.serviceAndUrlModel,
    (fieldPath) => {
      required(fieldPath.serviceType);
      required(fieldPath.url);
      validate(fieldPath.url, () => {
        return this.loadingState() === 'error'
          ? {
              kind: 'incorrect',
            }
          : null;
      });
      disabled(fieldPath.url, ({valueOf}) => !valueOf(fieldPath.serviceType));
    },
    {
      submission: {
        action: () => {
          this.validateUrl();
          return Promise.resolve();
        },
      },
    },
  );
  public readonly validateButtonEnabled = computed(() => this.serviceAndUrlForm.url().value() || this.loadingState() === 'loading');

  constructor() {
    effect(() => {
      const serviceType = this.serviceType();
      queueMicrotask(() => {
        this.serviceAndUrlForm.serviceType().value.set(serviceType ?? null);
      });
    });
    effect(() => {
      const url = this.url();
      this.serviceAndUrlForm.url().value.set(url ?? '');
      if (url) {
        this.store.dispatch(ExternalMapItemActions.clearLoadingState());
      }
    });
    effect(() => {
      if (this.serviceAndUrlForm.url().value()) {
        this.store.dispatch(ExternalMapItemActions.clearLoadingState());
      }
    });
    effect(() => {
      const serviceType = this.serviceAndUrlForm.serviceType().value();
      if (serviceType) {
        this.store.dispatch(MapImportActions.setServiceType({serviceType}));
      }
    });
  }

  public submit(event: Event) {
    event.preventDefault();
    this.validateUrl();
  }

  public validateUrl() {
    const url = this.serviceAndUrlForm.url().value();
    if (url) {
      this.store.dispatch(MapImportActions.setUrl({url}));
    }
  }
}
