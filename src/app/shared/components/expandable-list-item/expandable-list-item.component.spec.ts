import {Component, inputBinding, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ExpandableListItemComponent} from './expandable-list-item.component';
import {ExpandableListItemHarness} from './expandable-list-item.harness';

describe('ExpandableListItemComponent', () => {
  let fixture: ComponentFixture<ExpandableListItemComponent>;
  let harness: ExpandableListItemHarness;

  const expanded = signal(false);
  const header = signal('Available layers');
  const disabled = signal(false);
  const allowTabFocus = signal(true);
  const renderContentEagerly = signal(false);

  beforeEach(async () => {
    expanded.set(false);
    header.set('Available layers');
    disabled.set(false);
    allowTabFocus.set(true);
    renderContentEagerly.set(false);

    await TestBed.configureTestingModule({imports: [ExpandableListItemComponent]}).compileComponents();

    fixture = TestBed.createComponent(ExpandableListItemComponent, {
      bindings: [
        inputBinding('expanded', expanded),
        inputBinding('header', header),
        inputBinding('disabled', disabled),
        inputBinding('allowTabFocus', allowTabFocus),
        inputBinding('renderContentEagerly', renderContentEagerly),
      ],
    });
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ExpandableListItemHarness);
  });

  it('exposes the supplied header and expands on demand', async () => {
    expect(await harness.getTitle()).toBe('Available layers');
    expect(await harness.isExpanded()).toBe(false);

    await harness.expand();

    expect(await harness.isExpanded()).toBe(true);
  });

  it('opens when the controlled expanded input becomes true', async () => {
    expanded.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.isExpanded()).toBe(true);
  });

  it('prevents interaction when disabled', async () => {
    disabled.set(true);
    fixture.detectChanges();

    expect(await harness.isDisabled()).toBe(true);
    expect(await harness.isExpanded()).toBe(false);
  });

  it('removes the header from keyboard navigation when requested', async () => {
    allowTabFocus.set(false);
    fixture.detectChanges();

    expect(await harness.getHeaderTabIndex()).toBe('-1');
  });

  it('can render projected content before the panel is opened', async () => {
    @Component({
      imports: [ExpandableListItemComponent],
      template: `
        <expandable-list-item [renderContentEagerly]="true">
          <p class="projected-content">Layer details</p>
        </expandable-list-item>
      `,
    })
    class HostComponent {}

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    const hostHarness = await TestbedHarnessEnvironment.loader(hostFixture).getHarness(ExpandableListItemHarness);

    expect(await hostHarness.isExpanded()).toBe(false);
    expect(await hostHarness.getContentText()).toContain('Layer details');
  });

  it('defers projected content until the panel is opened by default', async () => {
    @Component({
      imports: [ExpandableListItemComponent],
      template: `
        <expandable-list-item>
          <p class="projected-content">Layer details</p>
        </expandable-list-item>
      `,
    })
    class HostComponent {}

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();
    const hostHarness = await TestbedHarnessEnvironment.loader(hostFixture).getHarness(ExpandableListItemHarness);

    expect(await hostHarness.getContentText()).not.toContain('Layer details');
    await hostHarness.expand();
    expect(await hostHarness.getContentText()).toContain('Layer details');
  });
});
