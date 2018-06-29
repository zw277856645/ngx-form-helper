import { ElementRef } from '@angular/core';
import { SubmitHandler } from './submit-handler';
import { isFunction } from 'util';
const $ = require('jquery');

export class SubmitHandlerDefault implements SubmitHandler {

    private $ele: JQuery;
    private $loading: JQuery;
    private isAutoCreatedLoading: boolean = false;
    private originLoadingClasses: string;
    private loadingClasses = 'icon notched circle loading';
    private startTime: number;
    private duration = 300;
    private isInit: boolean;

    constructor(private ele: ElementRef) {
        this.$ele = $(this.ele.nativeElement);
    }

    init() {
        // 设置loading
        this.$loading = this.$ele.find('[loading]').eq(0);
        if (this.$loading.length == 0) {
            this.$loading = this.$ele.find('i.icon,i.fa').eq(0);
        }
        if (this.$loading.length == 0) {
            this.$loading = $(`<div><div><i class="${this.loadingClasses}"></i></div></div>`);
            this.isAutoCreatedLoading = true;
        }

        // 设置样式
        if (this.isAutoCreatedLoading) {
            this.$ele.css({ position: 'relative' });

            this.$loading
                .css({
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    display: 'none'
                })
                .children()
                .css({
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'center'
                })
                .children()
                .css({
                    height: 'auto',
                    width: 'auto',
                    margin: '0',
                    'font-size': '1.4em',
                    'line-height': 'normal',
                    'animation-duration': '.9s',
                    outline: 'none'
                })
                .end()
                .end()
                .appendTo(this.$ele);
        } else {
            this.originLoadingClasses = this.$loading[ 0 ].className;

            this.$loading.css({
                'animation-duration': '.9s',
                outline: 'none'
            });
        }
    }

    destroy() {
        if (this.isAutoCreatedLoading) {
            this.$loading.remove();
        }
    }

    start() {
        if (!this.isInit) {
            this.init();
            this.isInit = true;
        }

        this.startTime = new Date().getTime();
        this.$ele.prop('disabled', true);

        if (this.isAutoCreatedLoading) {
            this.$loading
                .css({
                    'background-color': this.$ele.css('background-color'),
                    'border-radius': this.$ele.css('border-radius')
                })
                .show();
        } else {
            this.$loading.removeClass().addClass(this.loadingClasses);
        }
    }

    end(imedia?: boolean | Function, cb?: Function) {
        let diff = new Date().getTime() - this.startTime;
        let imd: boolean, fn: Function;

        if (isFunction(imedia)) {
            imd = false;
            fn = <Function>imedia;
        } else {
            imd = !!imedia;
            fn = cb;
        }

        setTimeout(() => {
            this.$ele.prop('disabled', false);

            if (this.isAutoCreatedLoading) {
                this.$loading.hide();
            } else {
                this.$loading.removeClass(this.loadingClasses).addClass(this.originLoadingClasses);
            }

            if (isFunction(fn)) {
                fn();
            }
        }, imd ? 0 : (diff < this.duration ? this.duration - diff : 0));
    }
}


