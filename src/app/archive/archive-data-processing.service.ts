import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PosterArt {
  url: string;
  width?: number;
  height?: number;
}

export interface ListEntries {
  title: string;
  description: string;
  programType: string;
  images: {posterArt: PosterArt};
  releaseYear: string;
}

export interface List {
  total?: number;
  entries: ListEntries[];
}


@Injectable()
export class ArchiveDataProcessingService {

  constructor(private http: HttpClient) { }

  getList(): Observable<List> {
    return this.http.get<List>('https://static.rviewer.io/challenges/datasets/dreadful-tomatoes/data.json');
  }

  sortByYear(a, b){
    if (a.releaseYear > b.releaseYear) {return -1; }
    if (a.releaseYear < b.releaseYear) {return 1; }
    return 0;
  }
}
