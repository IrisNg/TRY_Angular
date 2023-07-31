import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { LoadingService } from './loading.service';
import { ErrorService } from './error.service';

export interface ListingApi<TRequestParams, TResponse> {
  onGetAll(requestParams: TRequestParams): Observable<TResponse>;
}

export const LISTING_API_SERVICE = 'LISTING_API_SERVICE';
export const LISTING_ENABLE_INITIAL_FETCH = 'LISTING_ENABLE_INITIAL_FETCH';
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

  // To make listingApiService swappable, see angular docs 'useFactory'
  // Inject transformers here to use it during service initialization and initial listing fetch
  constructor(
    private loadingService: LoadingService,
    private errorService: ErrorService,
    @Inject(LISTING_API_SERVICE)
    private listingApiService: ListingApi<TRequestParams, TResponse>,
    @Optional()
    @Inject(LISTING_ENABLE_INITIAL_FETCH)
    private readonly enableInitialFetch: boolean,
    @Optional()
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
    if (this.enableInitialFetch) {
      // Initial fetch listing on service initialization
      this.loadingService
        .showLoadingUntilCompleted(
          this.errorService.showErrorIfCaught(
            this.onFetchListing(this.initialRequestPayload)
          )
        )
        .subscribe(this.onFetchListingSuccess.bind(this));
    }
  }

  ngOnDestroy(): void {
    console.log('listing service destroyed');
    this.unsubscribeRequestPayload();
  }

  private unsubscribeRequestPayload() {
    if (this.requestPayloadSubscription) {
      this.requestPayloadSubscription.unsubscribe();
    }
  }

  setRequestPayloadSubscription(requestPayload$: Observable<TRequestPayload>) {
    this.unsubscribeRequestPayload();

    // TODO: add universal debounce operator here? or leave it to implementation class?
    // When there is new requestPayload emitted, trigger refetch listing
    // If new requestPayload is emitted while still waiting for response,
    // cancel previous api request and send new request with latest requestPayload
    let obs$ = requestPayload$.pipe(
      tap((x) => {
        console.log('listing service received new request payload', x);
      }),
      switchMap((requestPayload: TRequestPayload) => {
        return this.loadingService.showLoadingUntilCompleted(
          this.errorService.showErrorIfCaught(
            this.onFetchListing(requestPayload)
          )
        );
      })
    );

    //TODO: don't crash listing if error is caught

    this.requestPayloadSubscription = obs$.subscribe(
      this.onFetchListingSuccess.bind(this)
    );
  }

  // Change request/response transformer after service initialization
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

  onFetchListing(requestPayload: TRequestPayload): Observable<TResponse> {
    this.fetchedListing.next(null);

    const requestParams = (this.requestTransformer?.(requestPayload) ??
      requestPayload) as TRequestParams;

    // Send new GetAll API request, share same request-response instance with all subscribers
    return this.listingApiService.onGetAll(requestParams).pipe(shareReplay());
  }

  onFetchListingSuccess(response: TResponse): void {
    const resultingResponse = (this.responseTransformer?.(response) ??
      response) as TResultingResponse;

    // Notify all listing$ subscribers of new listing response result
    this.fetchedListing.next(resultingResponse);
  }
}
