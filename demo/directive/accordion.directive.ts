import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { timer } from 'rxjs';
import { first, map, skipWhile } from 'rxjs/operators';

@Directive({
    selector: '[accordion]'
})
export class AccordionDirective implements AfterViewInit {

    @Input('accordion') options: any;
    @Input() initialIndex: number;

    $self: any;

    constructor(private self: ElementRef) {
        this.$self = $(self.nativeElement);
    }

    ngAfterViewInit() {
        if (!this.options) {
            this.options = {};
        }

        if (typeof this.initialIndex !== undefined && typeof this.initialIndex !== null) {
            timer(0, 200).pipe(
                map(() => this.$self.children().length),
                skipWhile(len => len <= 0),
                first()
            ).subscribe(() => {
                this.$self
                    .children('.title')
                    .eq(this.initialIndex)
                    .addClass('active')
                    .next('.content')
                    .addClass('active');
            });
        }

        this.$self.accordion(this.options);
    }

    behavior(behaviorName: string, arg: any) {
        return this.$self.accordion(behaviorName, arg);
    }
}
