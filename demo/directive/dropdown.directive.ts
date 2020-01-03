import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isNullOrUndefined } from 'util';

declare var $: any;

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
export class DropdownDirective implements ControlValueAccessor, AfterViewInit, OnChanges {

    @Input('dropdown') options: any;
    @Input() dynamic: boolean | number;
    @Input() dynamicItems: any[];
    @Input() defaultText: string;

    onHideEmitter = new EventEmitter();

    private $dropdown: any;
    private selectValue: any;
    private controlChange: Function = new Function();
    private controlTouch: Function = new Function();
    private initialValue: any;
    private flag: any;
    private flag2: any;

    constructor(private self: ElementRef) {
        this.$dropdown = $(self.nativeElement);
    }

    ngAfterViewInit() {
        if (!this.options) {
            this.options = {};
        }

        this.$dropdown.dropdown($.extend({}, this.options, {
            onChange: (value: string, text: string, $choice: any) => {
                if (value !== this.selectValue) {
                    this.selectValue = value;
                    this.controlChange(value);
                    this.controlTouch(value);

                    if (typeof this.options.onChange === 'function') {
                        this.options.onChange(value, text, $choice);
                    }

                    // 选择菜单中值为空的选项还原
                    if (!value) {
                        this.behavior('restore defaults');
                    }
                }
            },
            onHide: () => {
                if (typeof this.options.onHide === 'function') {
                    this.options.onHide();
                }

                this.onHideEmitter.emit();
            }
        }));
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.dynamicItems
            && changes.dynamicItems.currentValue
            && changes.dynamicItems.currentValue.length) {
            clearTimeout(this.flag2);
            this.flag2 = setTimeout(() => {
                if (this.initialValue) {
                    this.initValue(this.initialValue);
                    this.initialValue = null;
                }
            });
        }

        if (changes.defaultText && changes.defaultText.currentValue) {
            this.$dropdown.find('.default.text').text(this.defaultText);
        }
    }

    behavior(behaviorName: string, ...args: any[]) {
        return this.$dropdown.dropdown(behaviorName, args);
    }

    writeValue(value: any) {
        this.initialValue = value;
        if (this.dynamic) {
            clearTimeout(this.flag);
            this.flag = setTimeout(() => this.initValue(value), this.dynamic === true ? 0 : +this.dynamic);
        } else {
            this.initValue(value);
        }
    }

    registerOnChange(fn: Function) {
        this.controlChange = fn;
    }

    registerOnTouched(fn: Function) {
        this.controlTouch = fn;
    }

    private initValue(value: any) {
        if (isNullOrUndefined(value) && this.selectValue) {
            this.behavior('restore defaults');
        } else if (!isNullOrUndefined(value)) {
            this.behavior('set selected', String(value).split(','));
        }
    }

}
