import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'basemapImageLink'
})
export class BasemapImageLinkPipe implements PipeTransform {
  public transform(identifier: string): string {
    return `assets/images/basemaps/${identifier}.png`;
  }
}
