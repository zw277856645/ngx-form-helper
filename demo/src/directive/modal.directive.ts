import { AfterViewInit, Directive, ElementRef, Input, OnDestroy } from '@angular/core';

declare var $: any;

@Directive({
    selector: '[modal]',
    exportAs: 'modal'
})
export class ModalDirective implements AfterViewInit, OnDestroy {

    @Input('modal') options: any;

    $modal: any;

    private $body: any;
    private event: Event;

    constructor(private self: ElementRef) {
        this.$modal = $(self.nativeElement);
        this.$body = $(document.body);
    }

    ngAfterViewInit() {
        if (!this.options) {
            this.options = {};
        }

        this.$modal.modal($.extend({ transition: 'drop' }, this.options, {
            // 模态框显示时为目标对象增加'modal-open'类
            onShow: () => {
                if (this.event) {
                    let $target = $(this.event.srcElement);
                    $target.addClass('modal-open');
                }
                if (typeof this.options.onShow === 'function') {
                    return this.options.onShow();
                }
            },

            // 模态框隐藏时为删除目标对象'modal-open'类
            onHide: () => {
                if (this.event) {
                    let $target = $(this.event.srcElement);
                    $target.removeClass('modal-open');
                    this.event = null;
                }
                if (typeof this.options.onHide === 'function') {
                    return this.options.onHide();
                }
            }
        }));
    }

    ngOnDestroy() {
        this.$modal.off().remove();
    }

    behavior(behaviorName: string, ...args: any[]) {
        if (behaviorName === 'set event') {
            this.event = args[ 0 ];
        } else {
            return this.$modal.modal(behaviorName, args);
        }
    }
}
