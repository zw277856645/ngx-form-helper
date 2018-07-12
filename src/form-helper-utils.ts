import { Observable } from 'rxjs/Observable';
import { isArray, isNullOrUndefined } from 'util';
import 'rxjs/add/operator/catch';

export const ELEMENT_BIND_TO_CONTROL_KEY = '__element__';
export const noop = () => void(0);

const emptyObject = {};

export function doAfter(fn: () => Promise<any> | Observable<any> | void, cb: (...args: any[]) => void) {
    let ret;
    try {
        ret = fn();
        if (ret instanceof Promise) {
            ret.catch(() => emptyObject).then(cb);
        } else if (ret instanceof Observable) {
            ret.catch(() => Observable.of(emptyObject)).subscribe(cb);
        } else {
            cb(isNullOrUndefined(ret) ? emptyObject : ret);
        }
    } catch (e) {
        console.error(e);
        cb(emptyObject);
    }
}

export function findProxyItem($item: JQuery, expr: string) {
    let reg = /^([\\^~+]+\d*)+$/;
    if (!reg.test(expr)) {
        return null;
    }

    // 表达式合并/分组，如：^2^^3++~2~~+3^ -> ^6+2~4+3^1 -> [^6,+2,~4,+3,^1] -> [^6,+1,^1]
    let groups = parseProxyExpression(expr);
    if (!groups || groups.length == 0) {
        return null;
    }

    out: for (let i = 0, len = groups.length; i < len; i++) {
        let char = groups[ i ].charAt(0),
            num = parseInt(groups[ i ].substring(1)),
            n = 0;

        while (n++ < num) {
            if (char == '^') {
                $item = $item.parent();
            } else if (char == '~') {
                $item = $item.prev();
            } else {
                $item = $item.next();
            }

            if ($item.length == 0) {
                break out;
            }
        }

    }

    return $item;
}

function parseProxyExpression(expr: string) {
    let matches = expr.match(/[\\^~+]+?\d*/g);
    if (!matches || matches.length == 0) {
        return null;
    }

    matches = matches.map(m => m.length == 1 ? m + '1' : m);

    // 相同的相邻元素累加
    let groups = [], gpLen, prevNum, curNum;
    for (let i = 0, len = matches.length; i < len; i++) {
        gpLen = groups.length;
        if (i == 0 || !groups[ gpLen - 1 ].startsWith(matches[ i ].charAt(0))) {
            groups.push(matches[ i ]);
        } else {
            prevNum = parseInt(groups[ gpLen - 1 ].substring(1));
            curNum = parseInt(matches[ i ].substring(1));
            groups[ gpLen - 1 ] = groups[ gpLen - 1 ].charAt(0) + (prevNum + curNum);
        }
    }

    // ^/+~分组
    let splits = [], canPush;
    for (let i = 0, len = groups.length; i < len; i++) {
        if (groups[ i ].charAt(0) == '^') {
            splits.push(groups[ i ]);
        } else {
            canPush = isArray(splits[ splits.length - 1 ]);
            if (i == 0 || !canPush) {
                splits.push([ groups[ i ] ]);
            } else if (canPush) {
                splits[ splits.length - 1 ].push(groups[ i ]);
            }
        }
    }

    // 相邻~+合并
    return splits
        .map(v => {
            if (isArray(v)) {
                let prevNum = 0, nextNum = 0;
                v.forEach(ch => {
                    if (ch.startsWith('~')) {
                        prevNum += parseInt(ch.substring(1));
                    } else {
                        nextNum += parseInt(ch.substring(1));
                    }
                });
                if (prevNum == nextNum) {
                    return null;
                } else {
                    return (prevNum > nextNum ? '~' : '+') + Math.abs(prevNum - nextNum);
                }
            }
            return v;
        })
        .filter(v => v);
}

export function getDebounceTime($ele: JQuery, defVal: number = 300) {
    return parseInt($ele.data('debounceTime')) || defVal;
}

export function getScrollProxy($ele: JQuery) {
    return ($ele.data('scrollProxy') || '').replace(/\s/g, '');
}

export function getContextProxy($ele: JQuery) {
    let data = $ele.data('contextProxy');
    return data === false ? false : (data || '').replace(/\s/g, '');
}

export function getPosition($ele: JQuery) {
    return $ele.data('position');
}

export function getOffsetY($ele: JQuery) {
    return parseInt($ele.data('offsetY')) || 0;
}

export function getOffsetX($ele: JQuery) {
    return parseInt($ele.data('offsetX')) || 0;
}

export function getLeft($ele: JQuery) {
    return $ele.data('left');
}

export function getRight($ele: JQuery) {
    return $ele.data('right');
}

export function getTop($ele: JQuery) {
    return $ele.data('top');
}

export function getBottom($ele: JQuery) {
    return $ele.data('bottom');
}