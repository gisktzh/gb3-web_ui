import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {Store} from '@ngrx/store';
import {combineLatestWith, filter, Subscription, tap} from 'rxjs';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {selectTitle} from '../../../../../state/map/reducers/map-import.reducer';
import {map} from 'rxjs/operators';

interface DisplayNameFormGroup {
  name: FormControl<string | null>;
}

const NAME_CONSTRAINTS: ValidatorFn[] = [Validators.minLength(1), Validators.required, Validators.pattern(/\S/)];

@Component({
  selector: 'map-import-display-name',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './map-import-display-name.component.html',
  styleUrl: './map-import-display-name.component.scss',
})
export class MapImportDisplayNameComponent implements OnInit, OnDestroy {
  public readonly displayNameFormGroup: FormGroup<DisplayNameFormGroup> = this.formBuilder.group<DisplayNameFormGroup>({
    name: this.formBuilder.control(null, NAME_CONSTRAINTS),
  });

  private readonly title$ = this.store.select(selectTitle);
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly formBuilder: FormBuilder,
  ) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.displayNameFormGroup.controls.name.valueChanges
        .pipe(
          // prevent race condition where validation is not yet complete
          combineLatestWith(this.displayNameFormGroup.statusChanges),
          filter(([_, status]) => status === 'VALID'),
          map(([name, _]) => name as string),
          filter((name) => name !== null),
          tap((name) => this.store.dispatch(MapImportActions.setTitle({title: name}))),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.title$.pipe(tap((title) => this.displayNameFormGroup.controls.name.setValue(title ?? null))).subscribe());
  }
}
