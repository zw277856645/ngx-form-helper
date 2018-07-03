import { SubmitHandlerLoaderConfig } from './submit-handler-loader-config';
import { SubmitHandler } from './submit-handler';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
const $ = require('jquery');

export class SubmitHandlerLoader implements SubmitHandler {

    private config: SubmitHandlerLoaderConfig;
    private isInitial: boolean;
    private $loading: JQuery;
    private originIconClass: string;
    private startTime: number;

    constructor(private $ele: JQuery,
                config: SubmitHandlerLoaderConfig) {
        this.config = {
            className: 'fh-loader-theme-default',
            iconClassName: 'fh-loader-theme-icon-default',
            iconToggleStrategy: 'append',
            iconSelector: 'i.icon, i.fa',
            duration: 400
        };
        $.extend(this.config, config);
    }

    start() {
        if (!this.isInitial) {
            this.isInitial = true;
            if (this.config.iconSelector) {
                this.$loading = this.$ele.find(this.config.iconSelector).eq(0);
                if (this.$loading.length) {
                    this.originIconClass = this.$loading[ 0 ].className;
                }
            }
        }

        this.startTime = new Date().getTime();
        this.$ele.prop('disabled', true);

        if (this.$loading && this.$loading.length) {
            if (this.config.iconToggleStrategy == 'replace') {
                this.$loading.removeClass();
            }
            this.$loading.addClass(this.config.iconClassName);
        } else {
            this.$ele.addClass(this.config.className);
        }
    }

    end() {
        let diff = new Date().getTime() - this.startTime;
        let duration = diff < this.config.duration ? this.config.duration - diff : 0;

        return Observable.interval(duration).first().map(() => {
            this.$ele.prop('disabled', false);

            if (this.$loading && this.$loading.length) {
                this.$loading.removeClass(this.config.iconClassName);
                if (this.config.iconToggleStrategy == 'replace') {
                    this.$loading.addClass(this.originIconClass);
                }
            } else {
                this.$ele.removeClass(this.config.className);
            }
        });
    }

}


