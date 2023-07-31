import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

@Injectable()
export class ErrorService {
  private errorSubject = new BehaviorSubject<string>('');
  public errorMessage$: Observable<string> = this.errorSubject.asObservable();

  constructor() {}

  showErrorIfCaught<T>(obs$: Observable<T>): Observable<T> {
    return of(null).pipe(
      tap(() => this.clearError()),
      switchMap(() => obs$),
      catchError((error: Error) => {
        console.log('Error service caught error', error)
        this.addError(error);
        return throwError(() => error);
      })
    );
  }

  clearError() {
    this.errorSubject.next('');
  }
  addError(error: Error) {
    this.errorSubject.next(error?.message ?? 'Something went wrong.');
  }
}
