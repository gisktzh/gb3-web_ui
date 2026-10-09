import {ComponentHarness} from '@angular/cdk/testing';
import {MatExpansionPanelHarness} from '@angular/material/expansion/testing';

export class ExpandableListItemHarness extends ComponentHarness {
  public static readonly hostSelector = 'expandable-list-item';

  private readonly panel = this.locatorFor(MatExpansionPanelHarness);
  private readonly panelHeader = this.locatorFor('.expandable-list-item__header');
  private readonly title = this.locatorFor('.expandable-list-item-header__title');

  public async getTitle(): Promise<string> {
    return (await this.title()).text();
  }

  public async isExpanded(): Promise<boolean> {
    return (await this.panel()).isExpanded();
  }

  public async expand(): Promise<void> {
    await (await this.panel()).expand();
  }

  public async collapse(): Promise<void> {
    await (await this.panel()).collapse();
  }

  public async isDisabled(): Promise<boolean> {
    return (await this.panel()).isDisabled();
  }

  public async getHeaderTabIndex(): Promise<string | null> {
    return (await this.panelHeader()).getAttribute('tabindex');
  }

  public async getContentText(): Promise<string> {
    return (await this.panel()).getTextContent();
  }
}
