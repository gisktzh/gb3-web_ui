import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'mapRotation',
  standalone: false,
})
export class MapRotationPipe implements PipeTransform {
  public transform(rotation: number): string {
    return `rotate(${rotation - 45}deg)`;
  }
}
