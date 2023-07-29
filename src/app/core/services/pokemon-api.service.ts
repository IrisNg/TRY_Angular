import { Injectable } from '@angular/core';
import { ListingApi } from './listing.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RequestParams } from 'src/app/shared/types/http.model';
import { ListingResponse } from 'src/app/shared/components/listing/listing.component';
import { GET_ALL_POKEMONS_V1_ENDPOINT } from '../api-endpoints/pokemon-api';

export interface GetAllRequestParams extends RequestParams {
  search: string;
  startCreatedDate: string;
  endCreatedDate: string;
}

export interface GetAllResponse extends ListingResponse {
  count: number;
  items: { Id: number; Name: string }[];
}

@Injectable({ providedIn: 'root' })
export class PokemonApiService
  implements ListingApi<GetAllRequestParams, GetAllResponse>
{
  constructor(private http: HttpClient) {}

  public onGetAll(
    requestParams: GetAllRequestParams
  ): Observable<GetAllResponse> {
    // TODO: can create custom http client and put baseUrl + withCredentials inside?
    const options: { withCredentials: boolean; params?: RequestParams } = {
      withCredentials: true,
    };

    if (requestParams) {
      options['params'] = requestParams;
    }

    return this.http.get<GetAllResponse>(GET_ALL_POKEMONS_V1_ENDPOINT, options);
  }
}
