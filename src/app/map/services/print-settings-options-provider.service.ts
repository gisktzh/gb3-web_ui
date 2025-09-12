import {Injectable} from '@angular/core';
import {PrintFormValues, ToArrays} from 'src/app/shared/interfaces/print-form.interface';
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
    checkPriority: (keyof PrintCapabilitiesCombination)[],
  ): ToArrays<PrintCapabilitiesCombination> {
    const available: ToArrays<PrintCapabilitiesCombination> = {
      reportType: this.getUnqiueOptions<'reportType'>(allCombinations, 'reportType'),
      reportOrientation: this.getUnqiueOptions<'reportOrientation'>(allCombinations, 'reportOrientation'),
      layout: this.getUnqiueOptions<'layout'>(allCombinations, 'layout'),
      dpi: this.getUnqiueOptions<'dpi'>(allCombinations, 'dpi'),
      fileFormat: this.getUnqiueOptions<'fileFormat'>(allCombinations, 'fileFormat'),
      showLegend: this.getUnqiueOptions<'showLegend'>(allCombinations, 'showLegend'),
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
        // Explicitly casting to `any` since TS thinks the type of the items in the same array might magically change.
        available[otherKey] = available[otherKey]
          .filter((v) => allCombinations.some((c) => c[currentKey] === selectedValue && c[otherKey] === v))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Since we know it's the same (available[otherKey] = available[otherKey].filter - filter doesn't alter value types), but TS thinks that it sometimes isn't we need to go via any.
          .filter((v) => v !== undefined && v !== null) as any;
      }
    });

    return available;
  }
}
