import {Component, computed, inject, signal} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Municipality} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {selectMunicipalities, selectMunicipalitiesLoadingState} from '../../../../state/map/reducers/data-download-region.reducer';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatFormField, MatLabel, MatInput} from '@angular/material/input';
import {MatAutocompleteTrigger, MatAutocomplete, MatOption} from '@angular/material/autocomplete';
import {MatButton} from '@angular/material/button';
import {form, required, disabled} from '@angular/forms/signals';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'data-download-select-municipality-dialog',
  templateUrl: './data-download-select-municipality-dialog.component.html',
  styleUrls: ['./data-download-select-municipality-dialog.component.scss'],
  imports: [
    ApiDialogWrapperComponent,
    MatFormField,
    MatLabel,
    MatInput,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    MatButton,
    FormsModule,
  ],
})
export class DataDownloadSelectMunicipalityDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<DataDownloadSelectMunicipalityDialogComponent, Municipality | undefined>>(MatDialogRef);
  private readonly store = inject(Store);

  public readonly municipalities = this.store.selectSignal(selectMunicipalities);
  public readonly loadingState = this.store.selectSignal(selectMunicipalitiesLoadingState);
  public readonly municipalityModel = signal<{municipality: Municipality | null}>({
    municipality: null,
  });
  public readonly filterValue = signal<string | null>('');
  public municipalityForm = form(this.municipalityModel, (fieldPath) => {
    required(fieldPath.municipality);
    disabled(fieldPath.municipality, () => this.loadingState() !== 'loaded');
  });
  public readonly filteredMunicipalities = computed(() => {
    const filterValue = (this.filterValue() || '').toLowerCase().trim();
    if (filterValue.length === 0) {
      return this.municipalities();
    }

    const municipalities = this.municipalities();
    if (!municipalities) {
      return [];
    }

    return municipalities.filter((municipality) => municipality.name.toLowerCase().includes(filterValue));
  });

  public cancel() {
    this.close();
  }

  public continue() {
    const municipalityField = this.municipalityForm.municipality();
    const municipalityValue = municipalityField.value();
    if (municipalityField.valid() && municipalityValue) {
      this.close(municipalityValue);
    } else {
      this.cancel();
    }
  }

  private close(municipality?: Municipality) {
    this.dialogRef.close(municipality);
  }

  public getMunicipalityName(municipality: Municipality | null): string {
    return municipality?.name ?? '';
  }
}
