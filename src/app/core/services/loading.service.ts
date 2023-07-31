import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';

@Injectable()
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {}

  showLoadingUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
    return of(null).pipe(
      tap(() => this.loadingOn()),
      switchMap(() => obs$),
      finalize(() => {
        this.loadingOff();
      })
    );
  }
  loadingOn() {
    this.loadingSubject.next(true);
  }
  loadingOff() {
    this.loadingSubject.next(false);
  }
}
