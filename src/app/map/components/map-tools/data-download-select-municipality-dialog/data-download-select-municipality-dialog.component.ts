import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {BehaviorSubject, Subscription, tap} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {FormControl, Validators} from '@angular/forms';
import {Municipality} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {selectMunicipalities, selectMunicipalitiesLoadingState} from '../../../../state/map/reducers/data-download-region.reducer';

@Component({
  selector: 'data-download-select-municipality-dialog',
  templateUrl: './data-download-select-municipality-dialog.component.html',
  styleUrls: ['./data-download-select-municipality-dialog.component.scss'],
  standalone: false,
})
export class DataDownloadSelectMunicipalityDialogComponent implements OnInit, OnDestroy {
  @ViewChild('municipalityInput') private input?: ElementRef<HTMLInputElement>;
  public readonly filteredMunicipalities = new BehaviorSubject<Municipality[]>([]);
  public municipalities: Municipality[] | undefined;
  public loadingState: LoadingState;
  public municipalityFormControl: FormControl<Municipality | null> = new FormControl({value: null, disabled: true}, [Validators.required]);

  private readonly subscriptions: Subscription = new Subscription();
  private readonly municipalities$ = this.store.select(selectMunicipalities);
  private readonly loadingState$ = this.store.select(selectMunicipalitiesLoadingState);

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
      this.municipalities$
        .pipe(
          tap((municipalities) => {
            this.municipalities = municipalities;
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
