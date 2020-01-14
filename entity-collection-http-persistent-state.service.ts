import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { share } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export abstract class EntityCollectionHttpPersistentStateService<T> {

    protected httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    protected url: string;
    protected endpoint: string;
    protected stateBehaviorSubject: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
    protected objectIdSelector: (T: any) => string;

    constructor(protected httpClient: HttpClient, endpoint: string, objectIdSelector: (obj: T) => string) {
        this.url = environment.modelingApiUrlBase + environment.iwfApiEndpointBase;
        this.endpoint = endpoint;
        this.objectIdSelector = objectIdSelector;
        this.httpClient.get<T[]>(`${this.url}/${this.endpoint}/GetAll`).subscribe(result => { this.stateBehaviorSubject.next(result); });
    }

    public get stateObservable(): Observable<T[]> {
        return this.stateBehaviorSubject.asObservable();
    }

    public addOrUpdateMany(objects: T[]): Observable<number> {
        // Make rest call to api to add or update element in database if successful, continue and modify app state, otherwise throw error
        const returnObservable = this.httpClient.put<number>(`${this.url}/${this.endpoint}/PutMany/`, JSON.stringify(objects), this.httpOptions).pipe(share());
        returnObservable.subscribe(result => {
            const currentStateArray = this.stateBehaviorSubject.getValue();
            if (result < 0) {
                return;
            }
            for (const obj of objects) {
                const elementIndex = currentStateArray.findIndex(element => this.objectIdSelector(element) === this.objectIdSelector(obj));
                if (elementIndex >= 0) {
                    currentStateArray[elementIndex] = obj;
                } else {
                    currentStateArray.push(obj);
                }
            }
            this.stateBehaviorSubject.next(currentStateArray);
        }, error => {
            console.log(error);
        });
        return returnObservable;
    }

    public addOrUpdate(obj: T): Observable<T> {
        // Make rest call to api to add or update element in database if successful, continue and modify app state, otherwise throw error
        const returnObservable = this.httpClient.put<T>(`${this.url}/${this.endpoint}/Put/`, JSON.stringify(obj), this.httpOptions).pipe(share());
        returnObservable.subscribe(result => {
            // If result is successfull, then process internal state array, throw error
            if (result) {
                const currentStateArray = this.stateBehaviorSubject.getValue();
                const elementIndex = currentStateArray.findIndex(element => this.objectIdSelector(element) === this.objectIdSelector(obj));
                if (elementIndex >= 0) {
                    currentStateArray[elementIndex] = result;
                } else {
                    currentStateArray.push(result);
                }
                this.stateBehaviorSubject.next(currentStateArray);
            }
        }, error => {
            console.log(error);
        });
        return returnObservable;
    }

    public remove(objId: string): Observable<number> {
        const returnObservable = this.httpClient.delete(`${this.url}/${this.endpoint}/Delete/${objId}`, this.httpOptions).pipe(share()) as Observable<number>;
        returnObservable.subscribe(result => {
            if (result > 0) {
                const currentStateArray = this.stateBehaviorSubject.getValue();
                const elementIndex = currentStateArray.findIndex(obj => this.objectIdSelector(obj) === objId);
                if (elementIndex >= 0) {
                    currentStateArray.splice(elementIndex, 1);
                    this.stateBehaviorSubject.next(currentStateArray);
                }
            }
        }, error => {
            console.log(error);
        });
        return returnObservable;
    }

    public removeMany(objects: T[]): Observable<number> {
        const returnObservable = this.httpClient.post<number>(`${this.url}/${this.endpoint}/DeleteMany/`, JSON.stringify(objects), this.httpOptions).pipe(share());

        returnObservable.subscribe(result => {
            let currentStateArray = this.stateBehaviorSubject.getValue();
            if (!currentStateArray) { return; }

            if (result === currentStateArray.length) {
                objects.forEach(object => {
                    const filteredCurrentStateArray = currentStateArray.filter(obj => this.objectIdSelector(obj) === this.objectIdSelector(object));
                    currentStateArray = filteredCurrentStateArray;
                });
                this.stateBehaviorSubject.next(currentStateArray);
            }
        });
        return returnObservable;
    }
}
