import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {BehaviorSubject, Subscription, tap} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {selectLoadingState, selectProducts} from '../../../../state/map/reducers/data-download-product.reducer';
import {Municipality} from '../../../../shared/interfaces/geoshop-product.interface';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'data-download-select-municipality-dialog',
  templateUrl: './data-download-select-municipality-dialog.component.html',
  styleUrls: ['./data-download-select-municipality-dialog.component.scss'],
})
export class DataDownloadSelectMunicipalityDialogComponent implements OnInit, OnDestroy {
  @ViewChild('municipalityInput') input?: ElementRef<HTMLInputElement>;
  public readonly filteredMunicipalities = new BehaviorSubject<Municipality[]>([]);
  public municipalities: Municipality[] | undefined;
  public loadingState: LoadingState;
  public municipalityFormControl: FormControl<Municipality | null> = new FormControl({value: null, disabled: true}, [Validators.required]);

  private readonly subscriptions: Subscription = new Subscription();
  private readonly products$ = this.store.select(selectProducts);
  private readonly loadingState$ = this.store.select(selectLoadingState);

  constructor(
    private readonly dialogRef: MatDialogRef<DataDownloadSelectMunicipalityDialogComponent, Municipality | undefined>,
    private readonly store: Store,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public initSubscriptions() {
    this.subscriptions.add(
      this.products$
        .pipe(
          tap((products) => {
            this.municipalities = products?.municipalities;
            this.updateFilteredMunicipalities();
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.loadingState$
        .pipe(
          tap((loadingState) => {
            this.loadingState = loadingState;
            if (loadingState === 'loaded') {
              this.municipalityFormControl.enable();
            }
          }),
        )
        .subscribe(),
    );
  }

  public cancel() {
    this.close();
  }

  public continue() {
    const municipality = this.municipalityFormControl.value;
    if (municipality === null) {
      this.cancel();
    } else {
      this.close(municipality);
    }
  }

  private close(municipality?: Municipality) {
    this.dialogRef.close(municipality);
  }

  public updateFilteredMunicipalities() {
    if (this.municipalities) {
      const filterValue = this.input?.nativeElement.value?.toLowerCase();
      if (filterValue && filterValue !== '') {
        this.filteredMunicipalities.next(
          this.municipalities.filter((municipality) => municipality.name.toLowerCase().includes(filterValue)),
        );
      } else {
        this.filteredMunicipalities.next(this.municipalities);
      }
    } else {
      this.filteredMunicipalities.next([]);
    }
  }

  public getMunicipalityName(municipality: Municipality | null): string {
    return municipality?.name ?? '';
  }
}
