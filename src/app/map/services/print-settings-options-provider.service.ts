import {Injectable} from '@angular/core';
import {
  PrintFormAvailableOptionsFromCapabilities,
  PrintFormCapabilitiesCombination,
  PrintFormValues,
} from 'src/app/shared/interfaces/print-form.interface';
import {PrintCapabilitiesCombination} from 'src/app/shared/models/gb3-api-generated.interfaces';

@Injectable({
  providedIn: 'root',
})
export class PrintSettingsOptionsProviderService {
  public getUnqiueOptions<T extends keyof PrintCapabilitiesCombination>(
    allCombinations: PrintCapabilitiesCombination[],
    key: T,
  ): Array<PrintCapabilitiesCombination[typeof key]> {
    return [...new Set(allCombinations.map((c) => c[key]).filter((v) => v !== undefined && v !== null))];
  }

  public filterOptions(
    formValue: PrintFormValues,
    allCombinations: PrintCapabilitiesCombination[],
    checkPriority: (keyof PrintFormCapabilitiesCombination)[],
  ): PrintFormAvailableOptionsFromCapabilities {
    const allFormCombinations = this.mapAllCombinationsToFormFormat(allCombinations);

    const available: PrintFormAvailableOptionsFromCapabilities = {
      reportType: this.getUnqiueOptions<'report_type'>(allCombinations, 'report_type'),
      reportOrientation: this.getUnqiueOptions<'report_orientation'>(allCombinations, 'report_orientation'),
      layout: this.getUnqiueOptions<'layout'>(allCombinations, 'layout'),
      dpi: this.getUnqiueOptions<'dpi'>(allCombinations, 'dpi'),
      fileFormat: this.getUnqiueOptions<'file_format'>(allCombinations, 'file_format'),
      showLegend: this.getUnqiueOptions<'show_legend'>(allCombinations, 'show_legend'),
    };

    checkPriority.forEach((currentKey, i) => {
      // We get the value we filter for (i.e. all combinations where this value is set)
      // We then get the rest of the keys in the list to reduce the number of options based
      // on the current (and any previous) ones, narrowing down the space by the same rules
      // we had hardcoded at some point.
      const selectedValue = formValue[currentKey];
      const otherKeys = checkPriority.slice(i + 1);

      if (selectedValue === undefined) {
        return; // We don't check for an undefined value, since no combinations would look out of that.
      }

      for (const otherKey of otherKeys) {
        available[otherKey] = available[otherKey]
          .filter((v) => allFormCombinations.some((c) => c[currentKey] === selectedValue && c[otherKey] === v))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Since we know it's the same (available[otherKey] = available[otherKey].filter - filter doesn't alter value types), but TS thinks that it sometimes does, we need to go via any.
          .filter((v) => v !== undefined && v !== null) as any;
      }
    });

    return available;
  }

  private mapAllCombinationsToFormFormat(allCombinations: PrintCapabilitiesCombination[]): PrintFormCapabilitiesCombination[] {
    return allCombinations.map((c) => ({
      reportType: c.report_type,
      reportOrientation: c.report_orientation,
      layout: c.layout,
      dpi: c.dpi,
      fileFormat: c.file_format,
      showLegend: c.show_legend,
    }));
  }
}
