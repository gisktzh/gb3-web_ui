import {Component, ElementRef, EventEmitter, Input, Output, ViewChild, effect, inject, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {SearchMode} from '../../types/search-mode.type';
import {NgClass} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {SharedModule} from '../../shared.module';
import {toSignal} from '@angular/core/rxjs-interop';

const SEARCH_TERM_INPUT_DEBOUNCE_IN_MS = 300;

@Component({
  selector: 'search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  imports: [NgClass, MatIcon, SharedModule],
})
export class SearchInputComponent {
  private readonly store = inject(Store);

  @Input() public placeholderText!: string;
  @Input() public showFilterButton: boolean = true;
  @Input() public alwaysEnableClearButton: boolean = false;
  @Input() public clearButtonLabel?: string;
  @Input() public mode: SearchMode = 'normal';
  @Input() public focusOnInit: boolean = false;
  @Input() public disabled: boolean = false;
  @Input() public isAnyFilterActive: boolean = false;

  @Output() public readonly focusEvent = new EventEmitter<void>();
  @Output() public readonly changeSearchTermEvent = new EventEmitter<string>();
  @Output() public readonly clearSearchTermEvent = new EventEmitter<void>();
  @Output() public readonly openFilterEvent = new EventEmitter<void>();

  @ViewChild('searchInput') public readonly inputRef!: ElementRef<HTMLInputElement>;

  public screenMode = toSignal(this.store.select(selectScreenMode), {initialValue: 'regular'});

  private lastEmittedTerm = '';
  private shouldEmitNext = true;
  public searchTerm = signal('');

  constructor() {
    effect((onCleanup) => {
      const term = this.searchTerm();

      const timer = setTimeout(() => {
        if (term !== this.lastEmittedTerm && this.shouldEmitNext) {
          this.lastEmittedTerm = term;
          this.changeSearchTermEvent.emit(term);
        }
        this.shouldEmitNext = true;
      }, SEARCH_TERM_INPUT_DEBOUNCE_IN_MS);

      onCleanup(() => clearTimeout(timer));
    });
  }

  public clearInput() {
    this.clearSearchTermEvent.emit();
  }

  public openFilter() {
    this.openFilterEvent.emit();
  }

  public onInput(term: string) {
    this.searchTerm.set(term);
  }

  public setTerm(term: string, shouldEmit: boolean) {
    this.shouldEmitNext = shouldEmit;
    this.searchTerm.set(term);
  }

  public focus() {
    this.inputRef.nativeElement.focus();
  }
}
