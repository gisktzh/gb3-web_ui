import {Component} from '@angular/core';
import {ContactDetailComponent} from './contact-detail/contact-detail.component';
import {CdkAccordion} from '@angular/cdk/accordion';
import {AccordionItemComponent} from '../accordion-item/accordion-item.component';

@Component({
  selector: 'contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
  imports: [ContactDetailComponent, CdkAccordion, AccordionItemComponent],
})
export class ContactDetailsComponent {}
