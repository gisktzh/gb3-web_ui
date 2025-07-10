import {Directive, ElementRef, Input, inject} from '@angular/core';

@Directive({
  selector: '[tableColumnIdentifier]',
  standalone: false,
})
export class TableColumnIdentifierDirective {
  public readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() public topicId!: string;
  @Input() public layerId!: string;
  @Input() public featureId!: number;

  public get uniqueIdentifier() {
    return TableColumnIdentifierDirective.createUniqueColumnIdentifier(this.topicId, this.layerId, this.featureId);
  }

  public static createUniqueColumnIdentifier(topicId: string, layerId: string, featureId: number): string {
    return `${topicId}_${layerId}_${featureId}`;
  }
}
