import { Component, HostBinding, Input } from '@angular/core';
import { ErrorHandlerTextComponent } from './error-handler-text.component';

@Component({
    selector: 'eh-text-message',
    templateUrl: './error-handler-text-message.component.html'
})
export class ErrorHandlerTextMessageComponent {

    @Input() error: string;

    @Input() message: string;

    @HostBinding('class.active') get isError() {
        return this.errorHandlerText.hasError(this.error);
    }

    constructor(private errorHandlerText: ErrorHandlerTextComponent) {
    }
}