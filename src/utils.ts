import { defer, from, Observable, of } from 'rxjs';
import { SimpleChange } from '@angular/core';
import { ErrorMessage } from './error-handler/error-message';
import { ArrayOrGroupAbstractControls } from './form-helper.directive';
import { AbstractControl } from '@angular/forms';

export const noop = (): any => null;

export function isNotFirstChange(propChange: SimpleChange) {
    return propChange && !propChange.firstChange;
}

export function splitClassNames(classNames: string | boolean) {
    if (typeof classNames === 'string' && classNames) {
        return classNames.split(/\s/).filter(v => v);
    } else {
        return [];
    }
}

export function getProxyElement(item: Element, expr: string) {
    if (!item) {
        return null;
    }

    let reg = /^([\\^~+]+\d*)+$/;
    if (!reg.test(expr)) {
        return null;
    }

    // 表达式合并/分组，如：^2^^3++~2~~+3^ -> ^6+2~4+3^1 -> [^6,+2,~4,+3,^1] -> [^6,+1,^1]
    let groups = parseProxyExpression(expr);
    if (!groups || groups.length === 0) {
        return null;
    }

    out: for (let i = 0, len = groups.length; i < len; i++) {
        let char = groups[ i ].charAt(0),
            num = parseInt(groups[ i ].substring(1)),
            n = 0;

        while (n++ < num) {
            if (char === '^') {
                item = item.parentElement;
            } else if (char === '~') {
                item = item.previousElementSibling;
            } else {
                item = item.nextElementSibling;
            }

            if (!item) {
                break out;
            }
        }

    }

    return item;
}

function parseProxyExpression(expr: string) {
    let matches = expr.match(/[\\^~+]+?\d*/g);
    if (!matches || matches.length === 0) {
        return null;
    }

    matches = matches.map(m => m.length === 1 ? m + '1' : m);

    // 相同的相邻元素累加
    let groups: string[] = [], gpLen, prevNum, curNum;
    for (let i = 0, len = matches.length; i < len; i++) {
        gpLen = groups.length;
        if (i === 0 || !groups[ gpLen - 1 ].startsWith(matches[ i ].charAt(0))) {
            groups.push(matches[ i ]);
        } else {
            prevNum = parseInt(groups[ gpLen - 1 ].substring(1));
            curNum = parseInt(matches[ i ].substring(1));
            groups[ gpLen - 1 ] = groups[ gpLen - 1 ].charAt(0) + (prevNum + curNum);
        }
    }

    // ^/+~分组
    let splits: any[] = [], canPush;
    for (let i = 0, len = groups.length; i < len; i++) {
        if (groups[ i ].charAt(0) === '^') {
            splits.push(groups[ i ]);
        } else {
            canPush = Array.isArray(splits[ splits.length - 1 ]);
            if (i === 0 || !canPush) {
                splits.push([ groups[ i ] ]);
            } else if (canPush) {
                splits[ splits.length - 1 ].push(groups[ i ]);
            }
        }
    }

    // 相邻~+合并
    return splits
        .map(v => {
            if (Array.isArray(v)) {
                let prevNum = 0, nextNum = 0;
                v.forEach((ch: string) => {
                    if (ch.startsWith('~')) {
                        prevNum += parseInt(ch.substring(1));
                    } else {
                        nextNum += parseInt(ch.substring(1));
                    }
                });
                if (prevNum === nextNum) {
                    return null;
                } else {
                    return (prevNum > nextNum ? '~' : '+') + Math.abs(prevNum - nextNum);
                }
            }

            return v;
        })
        .filter(v => v);
}

export function async2Observable(fn: any): Observable<any> {
    return defer(() => {
        if (fn instanceof Observable) {
            return fn;
        } else if (fn instanceof Promise) {
            return from(fn);
        } else if (typeof fn === 'function') {
            return async2Observable(fn());
        } else {
            return of(fn);
        }
    });
}

/**
 * data api加载message，格式为validator[.order][.async]
 * 参数：指定order是因为页面被浏览器解析后属性顺序是不确定的，跟源代码书写顺序无关
 *      指定async是因为AbstractControl无法获取控件注册的验证器，无法自动识别异步消息
 */
export function loadMessagesFromDataset(ele: HTMLElement) {
    let messages: ErrorMessage[] = [];

    for (let k in ele.dataset) {
        let [ name, order ] = k.split('.');
        let finalOrder = /^first$/i.test(order) ? Number.MIN_SAFE_INTEGER
            : /^last$/i.test(order) ? Number.MAX_SAFE_INTEGER
                : /^-?\d+$/.test(order) ? parseInt(order)
                    : 0;

        messages.push({
            error: name,
            message: ele.dataset[ k ],
            order: finalOrder
        });
    }

    return messages.sort((a, b) => a.order - b.order);
}

export function arrayProviderFactory(config: any, array: any[]) {
    return Array.isArray(array) ? [ ...array, config ] : [ config ];
}

export function arrayOfAbstractControls(controls: ArrayOrGroupAbstractControls)
    : { name: string, control: AbstractControl }[] {
    if (!controls) {
        return [];
    }

    if (Array.isArray(controls)) {
        return controls.map((v, i) => ({ name: String(i), control: v }));
    } else {
        return Object.keys(controls).map(k => ({ name: k, control: controls[ k ] }));
    }
}