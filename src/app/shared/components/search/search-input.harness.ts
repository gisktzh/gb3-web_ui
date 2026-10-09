import {ComponentHarness} from '@angular/cdk/testing';

export class SearchInputHarness extends ComponentHarness {
  public static readonly hostSelector = 'search-input';

  private readonly input = this.locatorFor('.search__bar__input');
  private readonly clearButton = this.locatorFor('[aria-label="Sucheingabe löschen"]');
  private readonly optionalFilterButton = this.locatorForOptional('.search__filter-button, [aria-label="Suchresultate verfeinern"]');

  public async getValue(): Promise<string> {
    return (await this.input()).getProperty<string>('value');
  }

  public async setValue(value: string): Promise<void> {
    await (await this.input()).setInputValue(value);
  }

  public async focus(): Promise<void> {
    await (await this.input()).focus();
  }

  public async clear(): Promise<void> {
    await (await this.clearButton()).click();
  }

  public async isClearDisabled(): Promise<boolean> {
    return (await this.clearButton()).getProperty<boolean>('disabled');
  }

  public async hasFilterButton(): Promise<boolean> {
    return (await this.optionalFilterButton()) !== null;
  }

  public async openFilter(): Promise<void> {
    const filterButton = await this.optionalFilterButton();

    if (filterButton === null) {
      throw Error('Search input does not currently render a filter button.');
    }

    await filterButton.click();
  }
}
