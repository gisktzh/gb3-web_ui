import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MapServiceType} from '../../../../types/map-service.type';
import {Store} from '@ngrx/store';
import {distinctUntilChanged, filter, Subscription, tap} from 'rxjs';
import {NgIf} from '@angular/common';
import {SharedModule} from '../../../../../shared/shared.module';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {LoadingState} from '../../../../../shared/types/loading-state.type';
import {selectLoadingState} from '../../../../../state/map/reducers/external-map-item.reducer';
import {selectServiceType, selectUrl} from '../../../../../state/map/reducers/map-import.reducer';
import {ExternalMapItemActions} from '../../../../../state/map/actions/external-map-item.actions';

interface ServiceFormGroup {
  serviceType: FormControl<MapServiceType | null>;
  url: FormControl<string | null>;
}

@Component({
  selector: 'map-import-service-and-url',
  standalone: true,
  imports: [NgIf, SharedModule, ReactiveFormsModule],
  templateUrl: './map-import-service-and-url.component.html',
  styleUrl: './map-import-service-and-url.component.scss',
})
export class MapImportServiceAndUrlComponent implements OnInit, OnDestroy {
  public readonly serviceFormGroup = this.formBuilder.group<ServiceFormGroup>({
    serviceType: this.formBuilder.control(null, [Validators.required]),
    url: this.formBuilder.control({value: null, disabled: true}, [Validators.required]),
  });
  public loadingState: LoadingState;

  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly serviceType$ = this.store.select(selectServiceType);
  private readonly url$ = this.store.select(selectUrl);
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly store: Store,
    private formBuilder: FormBuilder,
  ) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public validateUrl() {
    this.store.dispatch(MapImportActions.setUrl({url: this.serviceFormGroup.controls.url.value!}));
  }

  public handleManualValidation(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.validateUrl();
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.serviceFormGroup.controls.serviceType.valueChanges
        .pipe(
          filter((serviceType): serviceType is MapServiceType => !!serviceType),
          tap((serviceType) => this.store.dispatch(MapImportActions.setServiceType({serviceType}))),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.serviceFormGroup.controls.url.valueChanges
        .pipe(
          distinctUntilChanged(),
          filter((url): url is string => !!url),
          tap((url) => this.store.dispatch(ExternalMapItemActions.clearLoadingState())),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.serviceType$.pipe(tap((serviceType) => this.handleServiceTypeChange(serviceType))).subscribe());
    this.subscriptions.add(this.url$.pipe(tap((url) => this.serviceFormGroup.controls.url.setValue(url ?? null))).subscribe());
    this.subscriptions.add(this.loadingState$.pipe(tap((loadingState) => this.handleLoadingState(loadingState))).subscribe());
  }

  private handleServiceTypeChange(serviceType: MapServiceType | undefined) {
    this.serviceFormGroup.controls.serviceType.setValue(serviceType ?? null);
    if (serviceType) {
      this.serviceFormGroup.controls.url.enable();
    } else {
      this.serviceFormGroup.controls.url.disable();
    }
  }

  private handleLoadingState(loadingState: LoadingState) {
    this.loadingState = loadingState;
    if (loadingState === 'error') {
      this.serviceFormGroup.controls.url.setErrors({incorrect: true});
    } else {
      this.serviceFormGroup.controls.url.setErrors(null);
    }
  }
}
