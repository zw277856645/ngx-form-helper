'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">ngx-form-helper documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>入门指南</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>概述
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>手册
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">模块列表</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/FormHelperModule.html" data-type="entity-link">FormHelperModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>组件列表</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/ErrorHandlerTextComponent.html" data-type="entity-link">ErrorHandlerTextComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorHandlerTextMessageComponent.html" data-type="entity-link">ErrorHandlerTextMessageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorHandlerTooltipComponent.html" data-type="entity-link">ErrorHandlerTooltipComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorHandlerTooltipMessageComponent.html" data-type="entity-link">ErrorHandlerTooltipMessageComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#directives-links"' :
                                'data-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>指令列表</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/CheckboxRequiredDirective.html" data-type="entity-link">CheckboxRequiredDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/ErrorHandlerSimpleDirective.html" data-type="entity-link">ErrorHandlerSimpleDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/FormHelperDirective.html" data-type="entity-link">FormHelperDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/ListRequiredDirective.html" data-type="entity-link">ListRequiredDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/SubmitHandlerLoaderDirective.html" data-type="entity-link">SubmitHandlerLoaderDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/TrimmedRequiredDirective.html" data-type="entity-link">TrimmedRequiredDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>类列表</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/ErrorHandler.html" data-type="entity-link">ErrorHandler</a>
                            </li>
                            <li class="link">
                                <a href="classes/ErrorHandlerTooltipConfig.html" data-type="entity-link">ErrorHandlerTooltipConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/Message.html" data-type="entity-link">Message</a>
                            </li>
                            <li class="link">
                                <a href="classes/TextMessage.html" data-type="entity-link">TextMessage</a>
                            </li>
                            <li class="link">
                                <a href="classes/TooltipMessage.html" data-type="entity-link">TooltipMessage</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>接口</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/CompleteConfig.html" data-type="entity-link">CompleteConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErrorHandlerSimpleConfig.html" data-type="entity-link">ErrorHandlerSimpleConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErrorHandlerTextConfig.html" data-type="entity-link">ErrorHandlerTextConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FormHelperConfig.html" data-type="entity-link">FormHelperConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubmitHandler.html" data-type="entity-link">SubmitHandler</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubmitHandlerLoaderConfig.html" data-type="entity-link">SubmitHandlerLoaderConfig</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>其他</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">枚举列表</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">函数</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">类型别名</a>
                            </li>
                        </ul>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});