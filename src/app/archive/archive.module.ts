import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ArchiveDataProcessingService } from './archive-data-processing.service';
import { ArchivePageComponent } from './archive-page/archive-page.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from '../shared/shared.module';

const materialModule = [
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule,
  NgbPaginationModule,
];

@NgModule({
  declarations: [
    ArchivePageComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    [materialModule],
    RouterModule.forChild([
      {path: '', component: ArchivePageComponent}
    ])
  ],
  exports: [
    [materialModule],
    RouterModule
  ],
  providers: [
    ArchiveDataProcessingService,
  ]
})
export class ArchiveModule { }
