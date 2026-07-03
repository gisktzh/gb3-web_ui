import {Component, input, output} from '@angular/core';
import {SkipLink} from '../../types/skip-link.type';
import {SkipLinkTemplateVariable} from '../../enums/skip-link-template-variable.enum';

@Component({
  selector: 'skip-link',
  templateUrl: './skip-link.component.html',
  styleUrl: './skip-link.component.scss',
  imports: [],
})
export class SkipLinkComponent {
  public readonly skipLinks = input<SkipLink[]>([]);
  public readonly skipToLocationEvent = output<SkipLinkTemplateVariable>();
}
