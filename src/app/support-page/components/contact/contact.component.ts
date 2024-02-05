import {Component} from '@angular/core';
import {LinkObject} from '../../../shared/interfaces/link-object.interface';

@Component({
  selector: 'contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  public email: LinkObject[] = [{title: 'gis@bd.zh.ch', href: 'mailto:gis@bd.zh.ch'}];
}
