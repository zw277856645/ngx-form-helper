import {
    EventEmitter,
    Input,
    Output,
    ElementRef,
    QueryList,
    Renderer2,
    Directive,
    OnInit,
    OnDestroy,
    ContentChildren, DoCheck, KeyValueDiffers, KeyValueDiffer
} from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/take';
import { FormHelperConfig } from './form-helper-config';
import { parseBoolean, smoothScroll2YPosition } from './form-utils';
import { ErrorHandlerTooltip } from './error-handler-tooltip';
import { SubmitHandlerDefault } from './submit-handler.default';
const $ = require('jquery');

@Directive({
    selector: '[formHelper]',
    exportAs: 'formHelper'
})
export class FormHelperDirective implements OnInit, OnDestroy, DoCheck {

    @Output('fhSubmit') submitEmitter = new EventEmitter<any>();
    @Output('reset') resetEmitter = new EventEmitter();

    @ContentChildren('submit')
    set submitBtns(btns: QueryList<ElementRef>) {
        btns.forEach(btn => {
            this.bindSubmitHandler(btn);
            Observable.fromEvent(btn.nativeElement, 'click').throttleTime(500).subscribe(() => this.submit(btn));
        });
    }

    @ContentChildren('reset')
    set resetBtns(btns: QueryList<ElementRef>) {
        btns.forEach(btn => this.renderer.listen(btn.nativeElement, 'click', () => this.reset()));
    }

    @Input()
    set config(config: FormHelperConfig) {
        $.extend(this._config, config);
    }

    @Input()
    set autoReset(autoReset: any) {
        this._config.autoReset = parseBoolean(autoReset);
    }

    @Input()
    set offset(offset: any) {
        this._config.offset = parseInt(offset);
    }

    @Input()
    set scrollTarget(scrollTarget: any) {
        if (typeof scrollTarget == 'string' && scrollTarget.trim().toLocaleLowerCase() == 'window') {
            this._config.scrollTarget = window;
        } else {
            this._config.scrollTarget = scrollTarget;
        }
    }

    @Input()
    set scrollable(scrollable: any) {
        this._config.scrollable = parseBoolean(scrollable);
    }

    @Input()
    set theme(theme: any) {
        this.$form.removeClass(this._config.theme).addClass(theme);
        this._config.theme = theme;
    }

    @Input()
    set errorHandler(errorHandler: any) {
        this._config.errorHandler = errorHandler;
    }

    @Input()
    set submitHandler(submitHandler: any) {
        this._config.submitHandler = submitHandler;
    }

    submitted: boolean;

    private _config: FormHelperConfig = new FormHelperConfig();
    private fieldCache: Map<string, JQuery> = new Map();
    private $form: JQuery;
    private subscription: Subscription;
    private keyValueDiffer: KeyValueDiffer<any, any>;
    private firstErrorName: string;
    private minOffset: number;
    private readonly errorHandlerKey = 'errorHandler';
    private readonly submitHandlerKey = 'submitHandler';
    private readonly fhScrollParentKey = 'fh-scroll-parent';

    // ------------------- 分割线 ------------------------------

    constructor(private renderer: Renderer2,
                private ngForm: NgForm,
                private keyValueDiffers: KeyValueDiffers,
                private form: ElementRef) {
        this.$form = $(form.nativeElement);
        this.$form.addClass(this._config.theme);

        this.$form.on('keydown', function (event) {
            if ((event.keyCode || event.which) == 13 && event.target.nodeName.toUpperCase() != 'TEXTAREA') {
                event.preventDefault();
            }
        });

        this.keyValueDiffer = this.keyValueDiffers.find({}).create();
    }

    ngOnInit() {
        this.subscription = Observable.fromEvent(window, 'resize').subscribe(() => this.repositionErrorHandlers());
    }

    ngDoCheck() {
        let changes = this.keyValueDiffer.diff(this.ngForm.controls);
        if (changes) {
            changes.forEachAddedItem(record => this.bindErrorHandler(record.key, record.currentValue));
        }
    }

    ngOnDestroy() {
        this.subscription && this.subscription.unsubscribe();
        this.$form.off();
        this.fieldCache.clear();
    }

    private repositionErrorHandlers() {
        this.fieldCache.forEach($field => {
            let handler = $field.data(this.errorHandlerKey);
            handler && handler.reposition();
        });
    }

    private bindErrorHandler(name: string, control: AbstractControl) {
        if (control instanceof FormGroup) {
            for (let name in control.controls) {
                this.bindErrorHandler(name, control.controls[ name ]);
            }
            return;
        }

        let $field = this.$form.find(`[name="${name}"],[ng-reflect-name="${name}"]`);

        if (!$field.length) {
            return;
        }

        this.fieldCache.set(name, $field);

        if (!$field.data(this.errorHandlerKey)) {
            let plugin, config;

            if (typeof this._config.errorHandler == 'string') {
                plugin = this._config.errorHandler;
                config = {};
            } else if (typeof this._config.errorHandler == 'object') {
                plugin = this._config.errorHandler.plugin;
                config = this._config.errorHandler;
            } else {
                plugin = '';
                config = {};
            }

            switch (plugin) {
                case 'tooltip':
                    $field.data(this.errorHandlerKey, new ErrorHandlerTooltip(name, this.$form, config));
                    break;
            }

            // 是否是远程验证
            let debounceTime = parseInt($field.attr('fh-remote') || '0');

            // 动态表单每次删除时，valueChanges和statusChanges等字段都会重刷
            if (control.statusChanges) {
                control.statusChanges.debounceTime(debounceTime).subscribe(() => {
                    if (control.enabled) {
                        let $field = this.fieldCache.get(name),
                            handler = $field && $field.data(this.errorHandlerKey),
                            $fhScrollParent;

                        if ($field && $field.is(':hidden')) {
                            $fhScrollParent = $field.closest('.' + this.fhScrollParentKey);
                        }

                        if (control.valid || control.pristine) {
                            handler && handler.whenValid();
                            $field && $field.removeClass('error');
                            $fhScrollParent && $fhScrollParent.removeClass('error');
                        } else {
                            handler && handler.whenInvalid();
                            $field && $field.addClass('error');
                            $fhScrollParent && $fhScrollParent.addClass('error');
                        }
                    }
                });
            }
        }
    }

    private bindSubmitHandler(btn: ElementRef) {
        setTimeout(() => {
            if (this._config.submitHandler) {
                switch (this._config.submitHandler) {
                    case 'default':
                        $(btn.nativeElement).data(this.submitHandlerKey, new SubmitHandlerDefault(btn));
                        break;
                }
            }
        });
    }

    private submit(btn: ElementRef) {
        this.submitted = true;
        
        if (this.ngForm.valid) {
            let submitHandler = $(btn.nativeElement).data(this.submitHandlerKey);
            if (submitHandler) {
                submitHandler.start();
            }

            this.submitEmitter.emit(submitHandler && submitHandler.end.bind(submitHandler));

            if (this._config.autoReset) {
                this.reset();
            }
        } else {
            this.firstErrorName = null;
            this.minOffset = Number.MAX_SAFE_INTEGER;

            for (let k in this.ngForm.controls) {
                this.validateControl(k, this.ngForm.controls[ k ]);
            }

            // 滚动到第一个错误域
            if (this.firstErrorName) {
                let fieldActualTop,
                    selfOffset = this.fieldCache.get(this.firstErrorName).attr('offset');

                if (this._config.scrollTarget === window) {
                    fieldActualTop = this.minOffset;
                } else {
                    // 修正使用semantic弹层，表单top由自身top叠加滚动窗体top
                    fieldActualTop = this.minOffset + $(this._config.scrollTarget).scrollTop();
                }

                smoothScroll2YPosition(this._config.scrollTarget, fieldActualTop
                    - (selfOffset == undefined ? this._config.offset : parseInt(selfOffset)));
            }
        }
    }

    private validateControl(name: string, ctl: AbstractControl) {
        if (ctl instanceof FormGroup) {
            for (let name in ctl.controls) {
                this.validateControl(name, ctl.controls[ name ]);
            }
            return;
        }

        let $field = this.fieldCache.get(name);

        // 设置control为dirty状态，使错误信息显示
        ctl.markAsDirty();
        if (ctl.invalid) {
            if ($field) {
                let handler = $field.data(this.errorHandlerKey);
                handler && handler.whenInvalid();
                $field.addClass('error');

                if ($field.is(':hidden')) {
                    let $fhScrollParent = $field.closest('.' + this.fhScrollParentKey);
                    if ($fhScrollParent.length) {
                        $fhScrollParent.addClass('error');
                    }
                }
            }
        }

        // 根据offset找到第一个错误域
        if (this._config.scrollable && ctl.invalid && $field) {
            let $closestVisibleField = this.findClosestVisibleField($field),
                top = $closestVisibleField.offset().top;

            if (!this.firstErrorName || top < this.minOffset) {
                this.firstErrorName = name;
                this.minOffset = top;
            }
        }
    }

    private findClosestVisibleField($field: JQuery) {
        let $parent = $field,
            $prev: JQuery,
            $next: JQuery,
            prevHasScrollKey: boolean,
            nextHasScrollKey: boolean;

        if ($parent.is(':hidden')) {
            do {
                $prev = $parent.prev();
                $next = $parent.next();
                prevHasScrollKey = $prev.hasClass(this.fhScrollParentKey);
                nextHasScrollKey = $next.hasClass(this.fhScrollParentKey);
                $parent = $parent.parent();
            } while ($parent.length > 0
            && $parent.is(':hidden')
            && !$parent.hasClass(this.fhScrollParentKey)
            && !prevHasScrollKey
            && !nextHasScrollKey
            && !$parent.is('form'));
        }

        return prevHasScrollKey ? $prev : nextHasScrollKey ? $next : $parent;
    }

    private reset() {
        this.ngForm.reset();
        this.resetEmitter.emit();
    }
}
