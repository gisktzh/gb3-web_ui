import {Directive, ElementRef, inject, input} from '@angular/core';

@Directive({selector: '[tableColumnIdentifier]'})
export class TableColumnIdentifierDirective {
  public readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  public readonly topicId = input.required<string>();
  public readonly layerId = input.required<string>();
  public readonly featureId = input.required<number>();

  public get uniqueIdentifier() {
    return TableColumnIdentifierDirective.createUniqueColumnIdentifier(this.topicId(), this.layerId(), this.featureId());
  }

  public static createUniqueColumnIdentifier(topicId: string, layerId: string, featureId: number): string {
    return `${topicId}_${layerId}_${featureId}`;
  }
}
