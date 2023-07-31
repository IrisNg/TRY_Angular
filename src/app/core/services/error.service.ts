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

export type ErrorMessageTransformer = (error: Error) => string;

@Injectable()
export class ErrorService {
  private errorSubject = new BehaviorSubject<string>('');
  public errorMessage$: Observable<string> = this.errorSubject.asObservable();

  constructor() {}

  showErrorIfCaught<T, F>(
    obs$: Observable<T>,
    options?: {
      errorMessageTransformer?: ErrorMessageTransformer;
      fallbackValue?: F;
    }
  ): Observable<T | F | undefined> {
    const { errorMessageTransformer, fallbackValue } = options ?? {};

    return of(null).pipe(
      tap(() => this.clearError()),
      switchMap(() => obs$),
      catchError((error: Error) => {
        console.log('Error service caught error', error);

        this.addError(errorMessageTransformer?.(error) ?? error.message);

        if (options && 'fallbackValue' in options) {
          // Emit fallbackValue to subscribe() next function
          // Especially important in preventing inner http observable from short-circuiting outer observable
          // outer observable = eg form values change observable, that should never complete or error-out
          return of(fallbackValue);
        }
        // Forward same error to subscribe() error function
        return throwError(() => error);
      })
    );
  }

  clearError() {
    this.errorSubject.next('');
  }

  addError(errorMessage?: string) {
    this.errorSubject.next(errorMessage ?? 'Something went wrong.');
  }
}
