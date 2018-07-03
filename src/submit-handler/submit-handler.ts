import { Observable } from 'rxjs/Observable';

export interface SubmitHandler {

    start(): void;

    end(): Promise<any> | Observable<any> | void;

    destroy?(): void;

}