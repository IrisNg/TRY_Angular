import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Observable,
  ReplaySubject,
  combineLatest,
  debounceTime,
  map,
  startWith,
  tap,
} from 'rxjs';
import { ListingService } from 'src/app/core/services/listing.service';
import {
  PageChangedEventData,
  PaginatorComponent,
  PaginatorConfig,
} from '../paginator/paginator.component';
import { ErrorService } from 'src/app/core/services/error.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { ShowLoaderDirective } from '../../directives/show-loader/show-loader.directive';

export type Filters = {
  [key: string]: string | number | boolean;
} & Partial<PageChangedEventData>;

export type NullableFilters = Filters | null;

type ListingItem = any;

export interface ListingResponse {
  items: ListingItem[];
  totalItemsCount?: number;
  pageNumber?: number;
}

export enum FilterComponentTypeEnum {
  SEARCH_BAR,
  SELECT_DROPDOWN,
}

export enum ListingContainerTypeEnum {
  TABLE,
  TILE,
}

// TODO: change to specific intialValue type based on Enum Option
interface FilterComponent {
  type: FilterComponentTypeEnum;
  name: string;
}

export type FilterComponentsConfig = FilterComponent[];

export interface ListingConfig {
  containerType: ListingContainerTypeEnum;
}

@Component({
  standalone: true,
  selector: 'shared-listing',
  templateUrl: 'listing.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ShowLoaderDirective,
    PaginatorComponent,
  ],
})
export class ListingComponent<
  TFilters extends NullableFilters,
  TRequestParams,
  TResponse,
  TResultingResponse extends ListingResponse
> implements OnInit
{
  @Input() filterComponentsConfig?: FilterComponentsConfig;
  @Input() listingConfig: ListingConfig = {
    containerType: ListingContainerTypeEnum.TILE,
  };
  @Input() paginatorConfig?: PaginatorConfig;
  @Input() initialFilters?: TFilters;

  public FilterComponentTypeEnum = FilterComponentTypeEnum;
  public ListingContainerTypeEnum = ListingContainerTypeEnum;

  @Input() listingItem?: TemplateRef<{ $implicit: ListingItem }>;

  private pageChanged = new ReplaySubject<Partial<TFilters> | null>(1);
  filtersForm?: FormGroup;
  public filters$?: Observable<TFilters>;

  public listing$?: Observable<TResultingResponse | null>;

  constructor(
    private listingService: ListingService<
      TFilters,
      TRequestParams,
      TResponse,
      TResultingResponse
    >,
    public errorService: ErrorService,
    public loadingService: LoadingService
  ) {}

  ngOnInit() {
    // Setup reactive filters form
    if (this.filterComponentsConfig && this.filterComponentsConfig.length > 0) {
      const formControls = this.filterComponentsConfig.reduce<{
        [key: string]: FormControl;
      }>((acc, cur) => {
        const { name } = cur;

        acc[name] = new FormControl(this.initialFilters?.[name] ?? null);

        return acc;
      }, {});

      this.filtersForm = new FormGroup(formControls);
    }

    // Get listing service observable
    this.listing$ = this.listingService.listing$;

    // Make listing service subscribe to any filter changes
    let filtersFormChange$ = this.filtersForm?.valueChanges.pipe(
      startWith(this.initialFilters ?? {}),
      debounceTime(1000)
    );
    let pageChange$ = this.paginatorConfig
      ? this.pageChanged.asObservable().pipe(
          startWith(
            this.initialFilters
              ? {
                  pageNumber: this.initialFilters.pageNumber ?? 1,
                  pageSize: this.initialFilters.pageSize ?? 20,
                }
              : {}
          )
        )
      : null;

    if (filtersFormChange$ && pageChange$) {
      this.filters$ = combineLatest([filtersFormChange$, pageChange$]).pipe(
        map(([filtersFormData, pageChangeData]) => {
          return {
            ...filtersFormData,
            ...pageChangeData,
          };
        }),
        tap((x) => console.log('valueee', x))
      );
    } else if (filtersFormChange$) {
      this.filters$ = filtersFormChange$ as Observable<TFilters>;
    } else if (pageChange$) {
      this.filters$ = pageChange$ as Observable<TFilters>;
    }

    // Also ossible to configure to refresh listing on form manual submit instead of form changes
    if (this.filters$) {
      this.listingService.setRequestPayloadSubscription(this.filters$);
    }
  }

  onPageChange($event: PageChangedEventData) {
    this.pageChanged.next($event as unknown as Partial<TFilters>);
  }
}
