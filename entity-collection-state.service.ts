import { Observable, BehaviorSubject } from 'rxjs';
export abstract class EntityCollectionStateService<T> {
    protected stateBehaviorSubject: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
    public stateObservable: Observable<T[]> = this.stateBehaviorSubject.asObservable();
    abstract addOrUpdateMany(array: T[]): Observable<number>;
    abstract addOrUpdate(entity: T): Observable<T>;
    abstract remove(entityId: any): Observable<number>;
}
