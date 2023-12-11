import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MapServiceType} from '../../../../types/map-service.type';
import {Store} from '@ngrx/store';
import {debounceTime, filter, Subscription, tap} from 'rxjs';
import {NgForOf, NgIf} from '@angular/common';
import {SharedModule} from '../../../../../shared/shared.module';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {selectLoadingState} from '../../../../../state/map/reducers/map-import.reducer';
import {LoadingState} from '../../../../../shared/types/loading-state.type';

interface ServiceFormGroup {
  serviceType: FormControl<MapServiceType | null>;
  url: FormControl<string | null>;
}

@Component({
  selector: 'map-import-service-and-url',
  standalone: true,
  imports: [NgForOf, NgIf, SharedModule, ReactiveFormsModule],
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

  private initSubscriptions() {
    this.subscriptions.add(
      this.serviceFormGroup.controls.serviceType.valueChanges
        .pipe(
          filter((serviceType): serviceType is MapServiceType => !!serviceType),
          tap(() => {
            this.serviceFormGroup.controls.url.setValue(null);
            this.serviceFormGroup.controls.url.enable();
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.serviceFormGroup.valueChanges
        .pipe(
          debounceTime(300),
          filter(({url, serviceType}) => !!url && !!serviceType),
          tap(({url, serviceType}) =>
            this.store.dispatch(MapImportActions.loadTemporaryExternalMap({url: url!, serviceType: serviceType!})),
          ),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.loadingState$.pipe(tap((loadingState) => (this.loadingState = loadingState))).subscribe());
  }
}
