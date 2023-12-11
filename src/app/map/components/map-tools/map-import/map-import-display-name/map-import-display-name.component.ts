import {Component, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Store} from '@ngrx/store';
import {MAP_LOADER_SERVICE, MAP_SERVICE} from '../../../../../app.module';
import {MapService} from '../../../../interfaces/map.service';
import {MapLoaderService} from '../../../../interfaces/map-loader.service';

interface DisplayNameFormGroup {
  name: FormControl<string | null>;
}

@Component({
  selector: 'map-import-display-name',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './map-import-display-name.component.html',
  styleUrl: './map-import-display-name.component.scss',
})
export class MapImportDisplayNameComponent {
  public readonly displayNameFormGroup: FormGroup<DisplayNameFormGroup> = this.formBuilder.group<DisplayNameFormGroup>({
    name: this.formBuilder.control(null, [Validators.required]),
  });

  constructor(
    private readonly store: Store,
    private formBuilder: FormBuilder,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    @Inject(MAP_LOADER_SERVICE) private readonly mapLoaderService: MapLoaderService,
  ) {}
}
