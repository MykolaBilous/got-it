import { DatePipe, formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter, ThemePalette } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { ActivatedRoute, Params } from '@angular/router';
import { Moment } from 'moment';
import { ArchiveDataProcessingService, List, ListEntries } from '../archive-data-processing.service';

export const PICK_FORMATS = {
  parse: {dateInput: {year: 'numeric'}},
  display: {
      dateInput: 'input',
      monthYearLabel: {year: 'numeric'},
      dateA11yLabel: {year: 'numeric'},
      monthYearA11yLabel: {year: 'numeric'},
  }
};

class PickDateAdapter extends NativeDateAdapter {
  locale: string;
  format(date: Date, displayFormat: Object): string {
      if (displayFormat === 'input') {
          return formatDate(date, 'yyyy', this.locale);
      } else {
          return date.toDateString();
      }
  }
}

enum DateType {
  StartDate,
  EndDate,
}

@Component({
  selector: 'app-archive-page',
  templateUrl: './archive-page.component.html',
  styleUrls: ['./archive-page.component.scss'],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS},
]
})

export class ArchivePageComponent implements OnInit {
  public filterToggle: boolean = false;
  public list: List;
  public getListEntries: ListEntries[] = [];
  public listEntries: ListEntries[] = [];
  public listType: string = '';
  public listEntriesTotal: number;
  public startPagePagination: number = 1;
  public pageSize: number = 10;
  public search: string = '';
  public loading: boolean = false;

  @ViewChild('startPickerInput') startDateInput: ElementRef;
  @ViewChild('endPickerInput') endDateInput: ElementRef;
  @ViewChild('startPicker') startPicker: MatDatepicker<Moment>;
  @ViewChild('endPicker') endPicker: MatDatepicker<Moment>;

  public minDate: Date = new Date(1895, 1, 1);
  public maxDate: Date = new Date();
  public dateFilterInput: DatePipe = new DatePipe('en-US');
  public yearLength: number = 4;
  public minYear: number = 1895;

  constructor(private archiveDataProcessingService: ArchiveDataProcessingService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.loading = true;
      this.listType = params.type;
      this.archiveDataProcessingService.getList()
        .subscribe(list => {
          this.search = this.startDateInput.nativeElement.value = this.endDateInput.nativeElement.value = '';
          this.list = list;
          this.getListEntries = this.list.entries.filter(listelem => listelem.programType == params.type).sort(this.archiveDataProcessingService.sortByYear);
          this.listEntries = this.getListEntries;
          this.updatePagination();
          this.loading = false;
        });
    });
  }

  public OninputSearch(event: KeyboardEvent): void {
    this.search = (event.target as HTMLInputElement).value;
    const startInputValue: string = this.startDateInput.nativeElement.value;
    const endInputValue: string = this.endDateInput.nativeElement.value;

    if (startInputValue.length == this.yearLength || endInputValue.length == this.yearLength) {
      if (startInputValue.length == this.yearLength && endInputValue.length == this.yearLength) {
        this.listEntries = this.getListEntries.filter( listEntrie =>
          (+listEntrie.releaseYear >= +startInputValue) &&
          (+listEntrie.releaseYear <= +endInputValue) &&
          (listEntrie.title.toLowerCase().includes(this.search)));
      } else if (startInputValue.length == this.yearLength) {
        this.listEntries = this.getListEntries.filter( listEntrie => (+listEntrie.releaseYear >= +startInputValue) && (listEntrie.title.toLowerCase().includes(this.search)));
      } else {
        this.listEntries = this.getListEntries.filter( listEntrie => (+listEntrie.releaseYear <= +endInputValue) && (listEntrie.title.toLowerCase().includes(this.search)));
      }
    } else {
      this.listEntries = this.getListEntries.filter( listEntrie => listEntrie.title.toLowerCase().includes(this.search));
    }
    this.updatePagination();
  }

/////////////// Datepicker functions //////////////////
 public openDatePicker(datepicker: MatDatepicker<Moment>): void {
    if (!datepicker.opened) {
      datepicker.open();
    } else {
      datepicker.close();
    }
  }

  public toggleDatePicker(): void {
    if (this.startDateInput.nativeElement.value.trim() && !(this.endDateInput.nativeElement.value.trim())) {
      this.startPicker.close();
      this.endPicker.open();
    }
  }

  public startYearSelectedHandler(value: Date, datepicker: MatDatepicker<Moment>): void {
    this.startDateInput.nativeElement.value = this.dateFilterInput.transform(value, 'yyyy');
    this.dateFilterFunction(DateType.StartDate);
    this.endPicker.open();
    datepicker.close();
  }

  public endYearSelectedHandler(value: Date, datepicker: MatDatepicker<Moment>): void {
    this.endDateInput.nativeElement.value = this.dateFilterInput.transform(value, 'yyyy');
    this.dateFilterFunction(DateType.EndDate);
    if (!this.startDateInput.nativeElement.value.trim()) {
      this.startPicker.open();
    }
    datepicker.close();
  }

  public onInputDate(inputElem: KeyboardEvent): void {
    const target = inputElem.target as HTMLInputElement;

    if (target.value.length == this.yearLength) {
      if (target.id == 'mat-input-0') {
        this.dateFilterFunction(DateType.StartDate);
      } else {
        this.dateFilterFunction(DateType.EndDate);
      }
    }
  }

  public onBlurInput(inputElem: KeyboardEvent): void {
    const target = inputElem.target as HTMLInputElement;

    if (target.value.length < this.yearLength) {
      if (target.id == 'mat-input-0') {
        this.dateFilterDeleteFunction(DateType.StartDate);
      } else {
        this.dateFilterDeleteFunction(DateType.EndDate);
      }
    }
  }

  private dateFilterDeleteFunction(dateType: number): void {
    const startInputValue: string = this.startDateInput.nativeElement.value;
    const endInputValue: string = this.endDateInput.nativeElement.value;
    let secondParam: string;

    if (dateType == DateType.StartDate) {
      secondParam = endInputValue;
    } else if (dateType == DateType.EndDate) {
      secondParam = startInputValue;
    }

    if (this.search.trim() || secondParam.length == this.yearLength) {
      if (this.search.trim() && secondParam.length == this.yearLength) {
        if (dateType == DateType.StartDate) {
          this.listEntries = this.getListEntries.filter( listEntrie => (listEntrie.title.toLowerCase().includes(this.search)) && (+listEntrie.releaseYear <= +endInputValue));
        } else {
          this.listEntries = this.getListEntries.filter( listEntrie => (listEntrie.title.toLowerCase().includes(this.search)) && (+listEntrie.releaseYear >= +startInputValue));
        }
      } else if (this.search.trim()) {
        this.listEntries = this.getListEntries.filter( listEntrie => listEntrie.title.toLowerCase().includes(this.search));
      } else {
        if (dateType == DateType.StartDate) {
          this.listEntries = this.getListEntries.filter( listEntrie => +listEntrie.releaseYear <= +endInputValue);
        } else {
          this.listEntries = this.getListEntries.filter( listEntrie => +listEntrie.releaseYear <= +startInputValue);
        }
      }
    } else {
      this.listEntries = this.getListEntries;
    }
    this.updatePagination();
  }

  private dateFilterFunction(dateType: number): void {
    const startInputValue: string = this.startDateInput.nativeElement.value;
    const endInputValue: string = this.endDateInput.nativeElement.value;
    let secondParam: string;

    if (dateType == DateType.StartDate) {
      secondParam = endInputValue;
    } else if (dateType == DateType.EndDate) {
      secondParam = startInputValue;
    }

    if (this.search.trim() || secondParam.length == this.yearLength) {
      if (this.search.trim() && secondParam.length == this.yearLength) {
        this.listEntries = this.getListEntries.filter( listEntrie =>
          (listEntrie.title.toLowerCase().includes(this.search)) &&
          (+listEntrie.releaseYear >= +startInputValue) &&
          (+listEntrie.releaseYear <= +endInputValue));
      } else if (this.search.trim() && (dateType == DateType.StartDate)) {
        this.listEntries = this.getListEntries.filter( listEntrie => listEntrie.title.toLowerCase().includes(this.search) && (+listEntrie.releaseYear >= +startInputValue));
      } else if (this.search.trim() && (dateType == DateType.EndDate)) {
        this.listEntries = this.getListEntries.filter( listEntrie => listEntrie.title.toLowerCase().includes(this.search) && (+listEntrie.releaseYear <= +endInputValue));
      } else {
        this.dateComparison(startInputValue, endInputValue);
        this.listEntries = this.getListEntries.filter( listEntrie => (+listEntrie.releaseYear >= +startInputValue) && (+listEntrie.releaseYear <= +endInputValue));
      }
    } else if (dateType == DateType.StartDate) {
      this.listEntries = this.getListEntries.filter( listEntrie => +listEntrie.releaseYear >= +startInputValue);
    } else if (dateType == DateType.EndDate) {
      this.listEntries = this.getListEntries.filter( listEntrie => +listEntrie.releaseYear <= +endInputValue);
    }
    this.updatePagination();
  }

  private updatePagination(): void {
    this.listEntriesTotal = this.listEntries.length;
    this.startPagePagination = 1;
  }

  private dateComparison(s, e): void {
    if (s > e) {
      alert('The start date must be greater than the end date!');
    }
  }
  /////////////// Datepicker functions END//////////////////
}
