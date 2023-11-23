import {Component} from '@angular/core';
import {LinkableElement} from 'src/app/shared/interfaces/linkable-element.interface';

@Component({
  selector: 'contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  public email: LinkableElement[] = [{title: 'gis@bd.zh.ch', url: 'mailto:gis@bd.zh.ch', label: 'gis@bd.zh.ch'}];
}
