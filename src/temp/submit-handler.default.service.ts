import { ElementRef, Injectable } from '@angular/core';
import { SubmitHandlerDefault } from './submit-handler.default';
import { isFunction } from 'util';

@Injectable()
export class SubmitHandlerDefaultService {

    private eleRef: ElementRef;
    private handler: SubmitHandlerDefault;

    bindElement(ele: any) {
        if (ele instanceof ElementRef) {
            this.eleRef = ele;
        } else {
            this.eleRef = new ElementRef(ele);
        }
        this.handler = new SubmitHandlerDefault(this.eleRef);
        return this;
    }

    start() {
        if (this.handler) {
            this.handler.start();
        }
    }

    end(imedia?: boolean | Function, cb?: Function) {
        if (this.handler) {
            let imd: boolean, fn: Function;

            if (isFunction(imedia)) {
                imd = false;
                fn = <Function>imedia;
            } else {
                imd = !!imedia;
                fn = cb;
            }

            this.handler.end(imd, () => {
                fn();
                this.handler.destroy();
            });
        }
    }
}
