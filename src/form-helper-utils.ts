import { Observable } from 'rxjs/Observable';

export function doAfter(fn: () => Promise<any> | Observable<any> | void, cb: () => void) {
    let ret = fn();
    if (ret instanceof Promise) {
        ret.then(cb);
    } else if (ret instanceof Observable) {
        ret.subscribe(cb);
    } else {
        cb();
    }
}