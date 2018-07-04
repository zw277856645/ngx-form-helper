import { Observable } from 'rxjs/Observable';

export const ELEMENT_BIND_TO_CONTROL_KEY = '__element__';

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

export function getDebounceTime($ele: JQuery, defVal: number = 300) {
    return parseInt($ele.data('debounceTime')) || defVal;
}