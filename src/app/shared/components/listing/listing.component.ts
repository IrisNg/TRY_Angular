import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable, Subscription, debounceTime } from 'rxjs';
import { ListingService } from 'src/app/core/services/listing.service';
import {
  PaginationComponent,
  PaginationConfig,
} from '../pagination/pagination.component';

export interface Filters {
  [key: string]: string | number | boolean;
}

export type NullableFilters = Filters | null;

type ListingItem = any;

export interface ListingResponse {
  items: ListingItem[];
  count?: number;
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
  initialValue?: string | number | boolean;
}

export type FilterComponentsConfig = FilterComponent[];

export interface ListingConfig {
  containerType: ListingContainerTypeEnum;
}

@Component({
  standalone: true,
  selector: 'shared-listing',
  templateUrl: 'listing.component.html',
  imports: [CommonModule, FormsModule, PaginationComponent],
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
  @Input() paginationConfig?: PaginationConfig;

  public filterComponentTypeEnum = FilterComponentTypeEnum;
  public listingContainerTypeEnum = ListingContainerTypeEnum;

  @Input() listingItem?: TemplateRef<{ $implicit: ListingItem }>;
  @ViewChild('form', { static: true }) filtersForm?: NgForm;
  public listing$?: Observable<TResultingResponse | null>;

  constructor(
    private listingService: ListingService<
      TFilters,
      TRequestParams,
      TResponse,
      TResultingResponse
    >
  ) {}

  ngOnInit() {
    this.listing$ = this.listingService.listing$;

    if (this.filtersForm) {
      // Possible to configure to refresh listing on form manual submit
      const filters$ = (
        this.filtersForm.form.valueChanges as Observable<TFilters>
      ).pipe(debounceTime(2000));
      this.listingService.setRequestPayloadSubscription(filters$);
    }
  }
}
