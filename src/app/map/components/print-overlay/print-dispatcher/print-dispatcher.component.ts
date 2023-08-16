import {Component, OnInit} from '@angular/core';
import {MapConfigUrlService} from '../../../services/map-config-url.service';

const PRINT_DELAY_IN_MS = 300;

/**
 * Helper component that prints the current page after a specified timeout expires. This is a workaround to automatically
 * print the page and ensure that the components are loaded and rendered.
 */
@Component({
  selector: 'print-dispatcher',
  templateUrl: './print-dispatcher.component.html',
  styleUrls: ['./print-dispatcher.component.scss'],
})
export class PrintDispatcherComponent implements OnInit {
  constructor(private readonly mapConfigUrlService: MapConfigUrlService) {}
  ngOnInit(): void {
    setTimeout(() => window.print(), PRINT_DELAY_IN_MS);
    this.addPrintEventListener();
  }

  public closePrint() {
    this.mapConfigUrlService.deactivatePrintMode();
  }

  /**
   * Adds an eventlistener for the afterprint event to close the window after the print preview ends.
   * @private
   */
  private addPrintEventListener() {
    window.addEventListener('afterprint', () => {
      this.closePrint();
    });
  }
}
