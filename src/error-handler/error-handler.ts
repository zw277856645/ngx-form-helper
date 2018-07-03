export interface ErrorHandler {

    whenValid(): void;

    whenInvalid(): void;

    reposition?(): void;

    destroy?(): void;
}
