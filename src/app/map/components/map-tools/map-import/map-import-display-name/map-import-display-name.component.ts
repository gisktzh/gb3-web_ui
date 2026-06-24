import {Component, effect, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Store} from '@ngrx/store';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {selectTitle} from '../../../../../state/map/reducers/map-import.reducer';

import {form, minLength, required, pattern, FormField} from '@angular/forms/signals';

@Component({
  selector: 'map-import-display-name',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, FormField],
  templateUrl: './map-import-display-name.component.html',
  styleUrl: './map-import-display-name.component.scss',
})
export class MapImportDisplayNameComponent {
  private readonly store = inject(Store);
  public readonly title = this.store.selectSignal(selectTitle);
  public readonly nameModel = signal<{name: string}>({
    name: '',
  });
  public nameForm = form(this.nameModel, (fieldPath) => {
    required(fieldPath.name);
    minLength(fieldPath.name, 1);
    pattern(fieldPath.name, /\S/);
  });

  constructor() {
    effect(() => {
      const title = this.title();
      queueMicrotask(() => {
        this.nameModel.set({name: title ?? ''});
      });
    });
    effect(() => {
      if (this.nameForm().valid()) {
        this.store.dispatch(MapImportActions.setTitle({title: this.nameModel().name}));
      }
    });
  }
}
