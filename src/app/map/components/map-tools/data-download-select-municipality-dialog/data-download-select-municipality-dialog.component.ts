import {Component, computed, inject, signal} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Municipality} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {selectMunicipalities, selectMunicipalitiesLoadingState} from '../../../../state/map/reducers/data-download-region.reducer';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatFormField, MatLabel, MatInput} from '@angular/material/input';
import {MatAutocompleteTrigger, MatAutocomplete, MatOption} from '@angular/material/autocomplete';
import {MatButton} from '@angular/material/button';
import {form, required, FormField} from '@angular/forms/signals';

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
    FormField,
  ],
})
export class DataDownloadSelectMunicipalityDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<DataDownloadSelectMunicipalityDialogComponent, Municipality | undefined>>(MatDialogRef);
  private readonly store = inject(Store);

  public municipalities = this.store.selectSignal(selectMunicipalities);
  public loadingState = this.store.selectSignal(selectMunicipalitiesLoadingState);

  public municipalityModel = signal<{municipality: Municipality | null; filter: string}>({
    municipality: null,
    filter: '',
  });
  public municipalityForm = form(this.municipalityModel, (fieldPath) => {
    required(fieldPath.municipality);
  });
  public isMunicipalityFieldDisabled = computed(() => this.loadingState() !== 'loaded');
  public filteredMunicipalities = computed(() => {
    const filterValue = this.municipalityForm.filter().value().toLowerCase().trim();
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
    if (municipalityField.valid()) {
      this.close(municipalityField.value()!);
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
