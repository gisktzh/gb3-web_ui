import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Gb3TextStyle, TextStyleConfiguration} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {MapConstants} from '../../../../../shared/constants/map.constants';
import {debounceTime, Subject, Subscription} from 'rxjs';

@Component({
  selector: 'text-edit',
  templateUrl: './text-edit.component.html',
  styleUrl: './text-edit.component.scss',
})
export class TextEditComponent implements OnInit, OnDestroy {
  @Input() public textStyle!: Gb3TextStyle;
  @Input() public labelText!: string;

  @Output() public updateStyleEvent = new EventEmitter<{style: Gb3TextStyle; labelText: string}>();

  public maxLength: number = MapConstants.TEXT_DRAWING_MAX_LENGTH;

  private readonly subscriptions = new Subscription();
  private readonly debouncer = new Subject<{
    field: keyof TextStyleConfiguration;
    value: number | string;
  }>();

  public ngOnInit(): void {
    this.subscriptions.add(
      this.debouncer.pipe(debounceTime(10)).subscribe(({field, value}) => {
        console.log('debounced');
        this.updateValue(field, value);
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  public updateValue(field: keyof TextStyleConfiguration, value: number | string) {
    if (field !== 'label') {
      this.textStyle = {
        ...this.textStyle,
        [field]: value.toString(),
      };
    }
    if (this.labelText) {
      this.updateStyleEvent.emit({style: this.textStyle, labelText: this.labelText});
    }
  }

  public updatedValueWithDelay(field: keyof TextStyleConfiguration, value: number | string) {
    this.debouncer.next({field, value});
  }
}
