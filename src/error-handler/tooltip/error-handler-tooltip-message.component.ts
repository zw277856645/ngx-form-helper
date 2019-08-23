import { Component, HostBinding, Input } from '@angular/core';
import { ErrorHandlerTooltipComponent } from './error-handler-tooltip.component';
import { InputBoolean } from 'cmjs-lib';

@Component({
    selector: 'eh-tooltip-message',
    templateUrl: './error-handler-tooltip-message.component.html'
})
export class ErrorHandlerTooltipMessageComponent {

    @Input() error: string;

    @Input() message: string;

    @Input() @InputBoolean() async: boolean;

    @HostBinding('style.display') display = 'block';

    constructor(private errorHandlerTooltip: ErrorHandlerTooltipComponent) {
    }

    get isError() {
        return this.errorHandlerTooltip.hasError(this.error);
    }
}