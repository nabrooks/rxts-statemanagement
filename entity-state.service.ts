import { Observable, BehaviorSubject } from 'rxjs';
export abstract class EntityStateService<T> {
    protected stateBehaviorSubject: BehaviorSubject<T> = new BehaviorSubject<T>(null);
    public stateObservable: Observable<T> = this.stateBehaviorSubject.asObservable();
    async abstract update(newEntityState: T): Promise<void>;
}
