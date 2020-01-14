import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRestHttpService } from './i-rest-http.service';

export abstract class AbstractRestHttpService<T> implements IRestHttpService<T> {

  httpOptions = { headers: new HttpHeaders({'Content-Type': 'application/json'}) };

  constructor(
    protected httpClient: HttpClient,
    protected url: string,
    protected endpoint: string) { }

  getAll(): Observable<T[]> {
    // console.log('communicating with : ' + `${this.url}/${this.endpoint}/GetAll`);
    return this.httpClient
      .get<T[]>(`${this.url}/${this.endpoint}/GetAll`) as Observable<T[]>;
  }

  get(id: any): Observable<T> {
    // console.log('communicating with : ' + `${this.url}/${this.endpoint}/GetById`);
    return this.httpClient
      .get<T>(`${this.url}/${this.endpoint}/GetById/${id}`) as Observable<T>;
  }

  put(obj: T): Observable<T> {
    // console.log('communicating with : ' + `${this.url}/${this.endpoint}/Put`);
    return this.httpClient
      .put<T>(`${this.url}/${this.endpoint}/Put/`, JSON.stringify(obj), this.httpOptions);
  }

  delete(id: any): Observable<number> {
    // console.log('communicating with : ' + `${this.url}/${this.endpoint}/Delete/${id}`);
    return this.httpClient
      .delete(`${this.url}/${this.endpoint}/Delete/${id}`, this.httpOptions) as Observable<number>;
   }
}
