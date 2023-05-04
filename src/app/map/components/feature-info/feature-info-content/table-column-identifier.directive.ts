import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[tableColumnIdentifier]'
})
export class TableColumnIdentifierDirective {
  @Input() public topicId!: string;
  @Input() public layerId!: string;
  @Input() public featureId!: number;
  public get uniqueIdentifier() {
    return TableColumnIdentifierDirective.getUniqueColumnIdentifier(this.topicId, this.layerId, this.featureId);
  }

  constructor(public readonly host: ElementRef<HTMLElement>) {}

  public static getUniqueColumnIdentifier(topicId: string, layerId: string, featureId: number): string {
    return `${topicId}_${layerId}_${featureId}`;
  }
}
