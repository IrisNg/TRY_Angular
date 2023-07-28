import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, mergeMap, of } from 'rxjs';

export interface IListingApi<TRequestParams, TResponse> {
  onGetAll(requestParams: TRequestParams): Observable<TResponse>;
}

// interface IFilters {
//     [key:string]: string | number | boolean
// }

export interface IFilters {
  [key: string]: string | number | boolean;
}
export type Filters = IFilters | null;

export const LISTING_API_SERVICE = 'LISTING_API_SERVICE';
export const LISTING_INITIAL_FILTERS = 'LISTING_INITIAL_FILTERS';

export class ListingService<
  TFilters extends Filters,
  TRequestParams,
  TResponse
> {
  fetchedListing = new BehaviorSubject<TResponse | null>(null);
  listing$ = this.fetchedListing.asObservable();

  // private listingApiService!: IListingApi<TFilters, TRequestParams, TResponse>;

  // Optional formatter callback
  private requestFormatter: ((filters: TFilters) => TRequestParams) | null =
    null;
  private responseFormatter: ((response: TResponse) => any) | null = null;

  // private filters!: TFilters;

  constructor(
    @Inject(LISTING_API_SERVICE)
    private listingApiService: IListingApi<TRequestParams, TResponse>,
    @Inject(LISTING_INITIAL_FILTERS) private filters: TFilters
  ) {}

  // TODO: maybe add this to make listingApiService swappable?
  // setListingApiService(listingApiService: IListingApi<TFilters, TResponse>) {
  //     this.listingApiService = listingApiService;
  // }

  setRequestFormatter(
    requestFormatter: (filters: TFilters) => TRequestParams
  ): void {
    this.requestFormatter = requestFormatter;
  }

  onFilterChange(): void {}

  onFetchListing() {
    const requestParams = (
      this.requestFormatter ? this.requestFormatter(this.filters) : this.filters
    ) as TRequestParams;

    // TODO: handle errors
    this.listingApiService
      .onGetAll(requestParams)
      .pipe(
        map((value) => {
          return this.responseFormatter !== null
            ? this.responseFormatter(value)
            : value;
        })
      )
      .subscribe((response) => this.fetchedListing.next(response));
  }
}
