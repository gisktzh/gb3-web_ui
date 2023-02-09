import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  public readonly documentClicked$: Subject<PointerEvent> = new Subject<PointerEvent>();
}
