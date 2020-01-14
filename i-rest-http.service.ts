import { Observable } from 'rxjs';

export interface IRestHttpService<T> {
  getAll(): Observable<T[]>;
  get(id: any): Observable<T>;
  put(id: any, obj: T): Observable<T>;
  delete(id: any): Observable<number>;
}
