import { Component, OnInit } from '@angular/core';
import { ErrorService } from 'src/app/core/services/error.service';
import {
  LISTING_API_SERVICE,
  ListingService,
} from 'src/app/core/services/listing.service';
import { LoadingService } from 'src/app/core/services/loading.service';
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
import { PaginatorConfig } from 'src/app/shared/components/paginator/paginator.component';

interface PokemonListingFilters extends Filters {
  search: string;
  pageNumber: number;
  pageSize: number;
}

const INITIAL_FILTERS: PokemonListingFilters = {
  search: '',
  pageNumber: 1,
  pageSize: 5,
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
    ErrorService,
    LoadingService,
  ],
})
export class PokemonListingComponent implements OnInit {
  public readonly FILTER_COMPONENTS_CONFIG: FilterComponentsConfig = [
    {
      type: FilterComponentTypeEnum.SEARCH_BAR,
      name: 'search',
    },
  ];

  public readonly LISTING_CONFIG: ListingConfig = {
    containerType: ListingContainerTypeEnum.TABLE,
  };

  public readonly PAGINATOR_CONFIG: PaginatorConfig = {
    pageSize: INITIAL_FILTERS.pageSize,
  };

  public readonly INITIAL_FILTERS = INITIAL_FILTERS;

  constructor() {}

  ngOnInit() {}
}
