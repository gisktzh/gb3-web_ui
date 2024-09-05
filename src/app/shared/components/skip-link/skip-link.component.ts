import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SkipLink} from '../../types/skip-link.type';

@Component({
  selector: 'skip-link',
  templateUrl: './skip-link.component.html',
  styleUrl: './skip-link.component.scss',
  standalone: true,
  imports: [],
})
export class SkipLinkComponent {
  @Input() public skipLinks: SkipLink[] = [];

  @Output() public skipToLocationEvent = new EventEmitter<string>();

  public skipToLocation(id: string): void {
    this.skipToLocationEvent.emit(id);
  }
}
