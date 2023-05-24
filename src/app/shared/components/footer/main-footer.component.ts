import {Component} from '@angular/core';

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss']
})
export class MainFooterComponent {
  public readonly currentYear = new Date().getFullYear();
}
