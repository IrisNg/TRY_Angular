import { Injectable } from '@angular/core';
import { IListingApi, IFilters } from './listing.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface IGetAllFilters extends IFilters {
  Search: string;
  StartCreatedDate: string;
  EndCreatedDate: string;
}

// type GetAllFilters = {
//     Search: string;
//     StartCreatedDate: Date;
//     EndCreatedDate: Date;
// } & IFilters;

interface GetAllResponse {
  totalCount: number;
  items: { Id: number; Name: string }[];
}

@Injectable({ providedIn: 'root' })
export class PokemonApiService
  implements IListingApi<IGetAllFilters, GetAllResponse>
{
  constructor(private http: HttpClient) {}

  public onGetAll(requestParams: IGetAllFilters): Observable<GetAllResponse> {
    return this.http.get<GetAllResponse>(
      'https://localhost:7001/api/pokemons',
      { params: requestParams }
    );
  }
}
