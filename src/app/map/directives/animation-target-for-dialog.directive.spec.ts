import {Component, signal, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AnimatedDialogService} from 'src/app/shared/services/animated-dialog.service';
import {AnimationTargetForDialogDirective} from './animation-target-for-dialog.directive';

@Component({
  standalone: true,
  imports: [AnimationTargetForDialogDirective],
  template: ` <div [animationTargetForDialog]="dialogType()"></div> `,
})
class TestHostComponent {
  public readonly dialogType = signal<Type<object>>(TestDialogComponent);
}

@Component({
  standalone: true,
  template: '',
})
class TestDialogComponent {}

@Component({
  standalone: true,
  template: '',
})
class OtherDialogComponent {}

describe('AnimationTargetForDialogDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let service: {
    registerAnimationTarget: ReturnType<typeof vi.fn>;
    unregisterAnimationTarget: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      registerAnimationTarget: vi.fn(),
      unregisterAnimationTarget: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        {
          provide: AnimatedDialogService,
          useValue: service,
        },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should register the dialog type with its host element', () => {
    const element = fixture.nativeElement.querySelector('div');

    expect(service.registerAnimationTarget).toHaveBeenCalledTimes(1);
    expect(service.registerAnimationTarget).toHaveBeenCalledWith(TestDialogComponent, element);
  });

  it('should unregister the dialog type when the directive is destroyed', () => {
    fixture.destroy();

    expect(service.unregisterAnimationTarget).toHaveBeenCalledTimes(1);
    expect(service.unregisterAnimationTarget).toHaveBeenCalledWith(TestDialogComponent);
  });

  it('should unregister the previous dialog type and register the new one when the input changes', () => {
    fixture.componentInstance.dialogType.set(OtherDialogComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div');

    expect(service.unregisterAnimationTarget).toHaveBeenCalledTimes(1);
    expect(service.unregisterAnimationTarget).toHaveBeenCalledWith(TestDialogComponent);

    expect(service.registerAnimationTarget).toHaveBeenCalledTimes(2);
    expect(service.registerAnimationTarget).toHaveBeenLastCalledWith(OtherDialogComponent, element);
  });
});
