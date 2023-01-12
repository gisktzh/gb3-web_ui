import {Component, OnInit} from '@angular/core';

const PRINT_DELAY_IN_MS = 300;

/**
 * Helper component that prints the current page after a specified timeout expires. This is a workaround to automatically
 * print the page and ensure that the components are loaded and rendered.
 */
@Component({
  selector: 'print-dispatcher',
  templateUrl: './print-dispatcher.component.html',
  styleUrls: ['./print-dispatcher.component.scss']
})
export class PrintDispatcherComponent implements OnInit {
  ngOnInit(): void {
    setTimeout(() => window.print(), PRINT_DELAY_IN_MS);
  }
}
