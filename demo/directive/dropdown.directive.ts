import { Directive, Input, ElementRef, EventEmitter, AfterViewInit } from '@angular/core';
import { isFunction, isNullOrUndefined } from 'util';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/takeWhile';

@Directive({
    selector: '[dropdown]',
    exportAs: 'dropdown',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: DropdownDirective,
            multi: true
        }
    ]
})
export class DropdownDirective implements ControlValueAccessor, AfterViewInit {

    @Input('dropdown') options: any;

    onHideEmitter = new EventEmitter();

    private $dropdown: any;
    private selectValue: any;
    private controlChange: Function = new Function();
    private controlTouch: Function = new Function();

    constructor(private self: ElementRef) {
        this.$dropdown = $(self.nativeElement);
    }

    ngAfterViewInit() {
        if (!this.options) {
            this.options = {};
        }

        this.$dropdown.dropdown($.extend({}, this.options, {
            onChange: (value: string, text: string, $choice: any) => {
                if (value != this.selectValue) {
                    this.selectValue = value;
                    this.controlChange(value);
                    this.controlTouch(value);
                    isFunction(this.options.onChange) && this.options.onChange(value, text, $choice);

                    // 选择菜单中值为空的选项还原
                    if (!value) {
                        this.behavior('restore defaults');
                    }
                }
            },
            onHide: () => {
                isFunction(this.options.onHide) && this.options.onHide();
                this.onHideEmitter.emit();
            }
        }));
    }

    behavior(behaviorName: string, ...args: any[]) {
        return this.$dropdown.dropdown(behaviorName, args);
    }

    writeValue(value: any) {
        if (isNullOrUndefined(value) && this.selectValue) {
            this.behavior('restore defaults');
        } else if (!isNullOrUndefined(value)) {
            Observable.timer(0, 300)
                .map(() => this.behavior('set selected', String(value).split(',')))
                .map(() => this.behavior('get text'))
                .takeWhile(txt => !txt || txt == this.behavior('get default text'))
                .subscribe();
        }
    }

    registerOnChange(fn: Function) {
        this.controlChange = fn;
    }

    registerOnTouched(fn: Function) {
        this.controlTouch = fn;
    }
}
