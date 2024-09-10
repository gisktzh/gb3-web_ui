import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SkipLink} from '../../types/skip-link.type';
import {TemplateVariables} from '../../enums/template-variables.enum';

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

  public skipToLocation(id: TemplateVariables): void {
    this.skipToLocationEvent.emit(id);
  }
}
