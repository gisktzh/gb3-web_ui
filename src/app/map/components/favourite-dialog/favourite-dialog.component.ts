import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'favourite-dialog',
  templateUrl: './favourite-dialog.component.html',
  styleUrls: ['./favourite-dialog.component.scss']
})
export class FavouriteDialogComponent implements OnInit {
  public nameFormControl!: FormControl<string | null>;

  constructor(private readonly dialogRef: MatDialogRef<FavouriteDialogComponent, string | null>) {}

  public get name() {
    return this.nameFormControl.value;
  }

  public ngOnInit() {
    this.nameFormControl = new FormControl('', [Validators.min(5), Validators.required, Validators.pattern(/[\S]/)]);
  }

  public close(abort: boolean = false) {
    this.dialogRef.close(abort ? undefined : this.name);
  }

  public abort() {
    this.close(true);
  }
}
