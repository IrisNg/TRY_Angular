import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';

export interface ListingApi<TRequestParams, TResponse> {
  onGetAll(requestParams: TRequestParams): Observable<TResponse>;
}

export const LISTING_API_SERVICE = 'LISTING_API_SERVICE';
export const LISTING_INITIAL_REQUEST_PAYLOAD = 'LISTING_INTIAL_REQUEST_PAYLOAD';
export const LISTING_REQUEST_TRANSFORMER = 'LISTING_REQUEST_TRANSFORMER';
export const LISTING_RESPONSE_TRANSFORMER = 'LISTING_RESPONSE_TRANSFORMER';

@Injectable()
export class ListingService<
  TRequestPayload,
  TRequestParams,
  TResponse,
  TResultingResponse
> implements OnDestroy
{
  private fetchedListing = new BehaviorSubject<TResultingResponse | null>(null);
  public listing$ = this.fetchedListing.asObservable();

  private requestPayloadSubscription?: Subscription;

  // To make listingApiService swappable, see angular docs useFactory
  // Inject transformers here to use it during service initialization and initial listing fetch
  constructor(
    @Inject(LISTING_API_SERVICE)
    private listingApiService: ListingApi<TRequestParams, TResponse>,
    @Inject(LISTING_INITIAL_REQUEST_PAYLOAD)
    private initialRequestPayload: TRequestPayload,
    @Optional()
    @Inject(LISTING_REQUEST_TRANSFORMER)
    private requestTransformer?: (
      requestPayload: TRequestPayload
    ) => TRequestParams,
    @Optional()
    @Inject(LISTING_RESPONSE_TRANSFORMER)
    private responseTransformer?: (response: TResponse) => TResultingResponse
  ) {
    this.onFetchListing(this.initialRequestPayload);
  }

  ngOnDestroy(): void {
    console.log('listing service destroyed');
    if (this.requestPayloadSubscription) {
      this.requestPayloadSubscription.unsubscribe();
    }
  }

  setRequestPayloadSubscription(requestPayload$: Observable<TRequestPayload>) {
    // TODO: add universal debounce operator here? or leave it to implementation class?
    this.requestPayloadSubscription = requestPayload$.subscribe(
      (requestPayload) => {
        // When there is new requestPayload, trigger refetch listing
        this.onFetchListing(requestPayload);
      }
    );
  }

  // Change transformer after service initialization
  setRequestTransformer(
    requestTransformer: (requestPayload: TRequestPayload) => TRequestParams
  ): void {
    this.requestTransformer = requestTransformer;
  }

  setResponseTransformer(
    responseTransformer: (response: TResponse) => TResultingResponse
  ): void {
    this.responseTransformer = responseTransformer;
  }

  onFetchListing(requestPayload: TRequestPayload) {
    const requestParams = (this.requestTransformer?.(requestPayload) ??
      requestPayload) as TRequestParams;

    // TODO: handle errors
    this.listingApiService
      .onGetAll(requestParams)
      .pipe(
        map((response) => {
          return this.responseTransformer?.(response) ?? response;
        })
      )
      .subscribe((resultingResponse) =>
        this.fetchedListing.next(resultingResponse as TResultingResponse)
      );
  }
}
