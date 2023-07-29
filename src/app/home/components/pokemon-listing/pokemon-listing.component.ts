import { Component, OnInit } from '@angular/core';
import {
  LISTING_API_SERVICE,
  LISTING_INITIAL_REQUEST_PAYLOAD,
  LISTING_REQUEST_TRANSFORMER,
  LISTING_RESPONSE_TRANSFORMER,
  ListingService,
} from 'src/app/core/services/listing.service';
import {
  PokemonApiService,
  GetAllRequestParams,
  GetAllResponse,
} from 'src/app/core/services/pokemon-api.service';
import {
  Filters,
  ListingComponent,
  FilterComponentsConfig,
  ListingConfig,
  FilterComponentTypeEnum,
  ListingContainerTypeEnum,
} from 'src/app/shared/components/listing/listing.component';
import { PaginationConfig } from 'src/app/shared/components/pagination/pagination.component';

interface PokemonListingFilters extends Filters {
  search: string;
}

const INITIAL_FILTERS: PokemonListingFilters = {
  search: 'query',
};

@Component({
  standalone: true,
  selector: 'home-pokemon-listing',
  templateUrl: 'pokemon-listing.component.html',
  imports: [ListingComponent],
  providers: [
    ListingService<
      PokemonListingFilters,
      GetAllRequestParams,
      GetAllResponse,
      GetAllResponse
    >,
    { provide: LISTING_API_SERVICE, useClass: PokemonApiService },
    { provide: LISTING_INITIAL_REQUEST_PAYLOAD, useValue: INITIAL_FILTERS },
  ],
})
export class PokemonListingComponent implements OnInit {
  public readonly FILTER_COMPONENTS_CONFIG: FilterComponentsConfig = [
    {
      type: FilterComponentTypeEnum.SEARCH_BAR,
      name: 'search',
      initialValue: INITIAL_FILTERS.search,
    },
  ];
  public readonly LISTING_CONFIG: ListingConfig = {
    containerType: ListingContainerTypeEnum.TABLE,
  };

  public readonly PAGINATION_CONFIG: PaginationConfig = {
    pageSize: 20,
  };

  constructor() {}

  ngOnInit() {}
}
