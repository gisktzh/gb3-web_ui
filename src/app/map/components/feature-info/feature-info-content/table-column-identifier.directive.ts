import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[tableColumnIdentifier]'
})
export class TableColumnIdentifierDirective {
  @Input() public topicId!: string;
  @Input() public layerId!: string;
  @Input() public featureId!: number;

  constructor(public readonly host: ElementRef<HTMLElement>) {}

  public get uniqueIdentifier() {
    return TableColumnIdentifierDirective.createUniqueColumnIdentifier(this.topicId, this.layerId, this.featureId);
  }

  public static createUniqueColumnIdentifier(topicId: string, layerId: string, featureId: number): string {
    return `${topicId}_${layerId}_${featureId}`;
  }
}
