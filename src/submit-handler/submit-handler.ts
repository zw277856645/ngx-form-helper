import { Observable } from 'rxjs';

export interface SubmitHandler {

    start(): void;

    end(): Promise<any> | Observable<any> | void;

    destroy?(): void;

}