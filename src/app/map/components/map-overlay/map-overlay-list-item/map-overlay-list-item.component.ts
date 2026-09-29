import {Component, input, ChangeDetectionStrategy, computed, inject, Signal} from '@angular/core';
import {ToggleButtonPosition} from '../../../types/toggle-button-position.type';
import {MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelContent} from '@angular/material/expansion';

import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {ShowTooltipIfTruncatedDirective} from '../../../../shared/directives/show-tooltip-if-truncated.directive';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'map-overlay-list-item',
  templateUrl: './map-overlay-list-item.component.html',
  styleUrls: ['./map-overlay-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatIcon,
    MatTooltip,
    ShowTooltipIfTruncatedDirective,
    RouterLink,
    MatExpansionPanelContent,
  ],
  host: {
    '[attr.data-nesting-level]': 'nestingLevel()',
  },
})
export class MapOverlayListItemComponent {
  private readonly parent = inject(MapOverlayListItemComponent, {
    optional: true,
    skipSelf: true,
  });

  public readonly overlayTitle = input('');
  public readonly metaDataLink = input<string>();
  public readonly forceExpanded = input(false);
  public readonly disabled = input(false);
  public readonly toggleButtonPosition = input<ToggleButtonPosition>('start');
  public readonly removeContentIndent = input(false);
  public readonly hasBackgroundColor = input(true);
  public readonly hasBorder = input(false);
  public readonly showInteractiveElements = input(true);

  public readonly nestingLevel: Signal<number> = computed(() => {
    const parentNestingLevel = this.parent?.nestingLevel();

    if (parentNestingLevel === undefined) {
      return 0;
    }

    return parentNestingLevel + 1;
  });
}
