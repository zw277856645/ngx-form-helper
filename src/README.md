# ngx-form-helper
angular表单验证辅助插件
for angular >= 6


## 安装
> npm install ngx-form-helper --save

```bash
PS：请使用3.0.0及之后的版本
```


## 引入module
```javascript
@NgModule({
    imports: [
        FormHelperModule
    ]
})
export class AppModule {
}
```


## 引入内置样式
在项目中第三方模块引入文件(通常为vendor.ts)中添加如下代码
```css
import 'ngx-form-helper/ngx-form-helper.css';
```
> note：ngx-form-helper.css中包含了完整的animate.css


## 表单配置(FormHelperConfig)
使用方法如下
```html
<form [formHelper]="config"></form>
```

> *名词解释*  
> selector：css选择器(string) | JQuery对象(JQuery) | dom对象(HTMLElement)  
> 表单域：指绑定了ngModel的元素  
> 表单组：指绑定了ngModelGroup的元素  
> 类名：指dom元素class属性

| 配置项                 | 参数类型                                        | 默认值                | 其他可选值 | 说明 |
| :--------------------- | :---------------------------------------------- | :-------------------- | :--------- | :--- |
| autoReset              | boolean                                         | true                  |            | 成功提交后是否自动重置表单 
| validateImmediate      | boolean                                         | false                 |            | 默认只在控件dirty状态触发，设置为true可立即触发验证。<br><br>可被表单域/表单组的data api配置覆盖
| context                | window/selector                                 | window                |            | 表单所处上下文，通常为window或含有滚动条的对象，影响滚动条正确滚动到第一条错误。<br><br>支持点号表达式：. -> 当前form，.. -> 父元素，../../ etc
| extraSubmits           | selector                                        |                       |            | 额外的提交按钮选择器。默认查找当前form下的type=submit的按钮。<br><br>若触发提交的按钮在form外部，或其他形式的提交按钮(如div)可设置此参数指定
| autoScroll             | boolean                                         | true                  |            | 是否自动滚动到第一个错误。<br><br>当表单域不可见时，自动寻找包含该元素的表单组，不可见继续寻找直到ngForm(不包含)，以此元素为定位对象。<br><br>若通过data api设置了滚动代理，则以滚动代理为优先定位对象。详情参见data-scroll-proxy语法
| offsetTop              | number                                          | 0                     |            | 错误定位使用，错误项距离浏览器顶部偏移量，负数向上，正数向下。通常设置为position:fixed的head高度
| className              | string/false                                    | fh-theme-default      |            | 表单域主题。指定的字符串会添加到form类名中。可修改默认值实现自定义主题
| errorClassName         | string/false                                    | fh-error              |            | 验证失败时`表单域`自动添加的类名
| errorGroupClassName    | string/false                                    | fh-group-error        |            | 验证失败时`表单组`自动添加的类名
| errorHandler           | string/false/{name:string; config?:any;}        | tooltip               | text       | 错误提示处理组件。<br>1. false：不使用错误处理组件<br>2. string：表示处理组件的名称<br>3. object：name表示处理组件的名称，config表示配置参数，覆盖组件中的默认参数
| submitHandler          | string/false/{name:string; config?:any;}        | loader                |            | 表单验证通过后，提交请求到请求结束之间状态的处理。<br>1. false：不使用提交处理组件<br>2. string：表示提交处理组件的名称<br>3. name表示提交处理组件的名称，config表示配置参数，覆盖组件中的默认参数
| onSuccess              | () => Promise/Observable/any                    |                       |            | 验证通过后的回调。如果含有异步处理，请返回异步句柄，否则submitHandler会立即执行结束，且后续的onComplete获取不到正确的参数
| onComplete             | (...res: any[]) => void                         |                       |            | submitHandler处理完成后的回调。在onSuccess后面执行，参数为onSuccess返回值
| onDeny                 | () => void                                      |                       |            | 验证不通过后的回调


## 全局data api
| 配置项                 | 参数类型 | 说明 |
| :--------------------- | :------- | :--- |
| validate-immediate     | boolean  | 覆盖FormHelperConfig中配置。使用方表单域/表单组
| debounce-time          | number   | 远程验证时使用，指定请求抖动时间。单位ms，使用方表单域/表单组。推荐使用AsyncValidatorLimit，详情参见远程验证辅助类章节
| scroll-proxy           | string   | 设置表单域/表单组滚动代理。<br><br>语法：^ -> 父节点，~ -> 前一个兄弟节点，+ -> 后一个兄弟节点，可以任意组合。<br>示例：\^\^\^，\^2，\~3\^4\+2


## 错误处理组件配置(ErrorHandlerTooltipConfig)
tooltip示例
```html
<div class="fh-message">
  <div [class.error]="nameCtrl.errors?.required">不能为空</div>
  <div class="pending" [class.error]="nameCtrl.errors?.nameUnique">重复</div>
</div>
```

> *名词解释*  
> 验证项：具体的某一错误语句所在节点

| 配置项                 | 参数类型                                                    | 默认值                    | 说明 |
| :--------------------- | :---------------------------------------------------------- | :------------------------ | :--- |
| selector               | string                                                      | .fh-message, [fh-message] | 如何查找tooltip的选择器
| contextProxy           | string                                                      | \^                        | 查找tooltip的上下文代理，会在指定的代理对象`节点本身`或`子节点`中寻找selector指定的节点。语法同data-scroll-proxy
| className              | string/false                                                | fh-tooltip-theme-default  | 主题样式。指定的字符串会添加到tooltip类名中。可修改默认值实现自定义主题
| pendingClassName       | string                                                      | pending                   | pending状态自动添加到tooltip的类名。相应的验证项需指定pending类名或属性
| invalidClassName       | string                                                      | invalid                   | invalid状态自动添加到tooltip的类名。相应的验证项需使用[class.error]指明错误时的条件
| position               | [top bottom][left center right]/right center/left center    | bottom right              | 提示相对表单域/表单组的位置
| animationIn            | string                                                      | animated fadeIn           | 显示动画。可使用animate.css
| animationOut           | string                                                      | animated fadeOut          | 隐藏动画
| duration               | number                                                      | 200                       | 动画时长(ms)。该设置会覆盖animationIn和animationOut动画的animation-duration
| zIndex                 | number                                                      | 1                         | tooltip z-index

### tooltip data api
| 配置项                 | 参数类型      | 说明 |
| :--------------------- | :------------ | :--- |
| context-proxy          | string/false  | 覆盖ErrorHandlerTooltipConfig中配置，与config中不同的是值可为false，代表不使用tooltip。使用方表单域/表单组
| offset-y               | number        | 垂直偏移量，负数向上，正数向下。使用方tooltip
| offset-x               | number        | 提示水平偏移量，负数向左，正数向右。使用方tooltip
| position               | string        | 覆盖ErrorHandlerTooltipConfig中配置。使用方tooltip
| left/right/top/bottom  | number        | 当tooltip父元素不可见时，tooltip无法计算位置，可使用这些值设定固定位置。使用方tooltip
| field-proxy            | string        | 表单域/表单组自身的代理对象。使用方表单域/表单组


## 错误处理组件配置(ErrorHandlerTextConfig)
错误文本示例  
```html
<div class="fh-message">  
  <div *ngIf="nameCtrl.errors?.required">不能为空</div>  
  <div *ngIf="nameCtrl.errors?.nameUnique">重复</div>  
</div> 
```

| 配置项                 | 参数类型                | 默认值                    | 说明 |
| :--------------------- | :---------------------- | :------------------------ | :--- |
| selector               | string                  | .fh-message, [fh-message] | 如何查找错误文本的选择器
| contextProxy           | string                  | \^                        | 查找错误文本的上下文代理，会在指定的代理对象`节点本身`或`子节点`中寻找selector指定的节点。语法同data-scroll-proxy
| className              | string/false            | fh-text-theme-default     | 主题样式。指定的字符串会添加到错误文本类名中。可修改默认值实现自定义主题
| inline                 | boolean                 | true                      | 错误文本是否与表单域/表单组在同一行
| align                  | left/center/right       | left                      | 错误文本水平位置。只在inline=false的情况下有效
| fontSize               | number                  | 13                        | 字体大小


## 提交处理组件配置(SubmitHandlerLoaderConfig)
| 配置项                 | 参数类型                | 默认值                         | 说明 |
| :--------------------- | :---------------------- | :----------------------------- | :--- |
| className              | string                  | fh-loader-theme-default        | 按钮主题样式
| iconClassName          | string                  | fh-loader-theme-icon-default   | 按钮中图标主题样式
| iconSelector           | string/false            | i.icon, i.fa                   | 寻找按钮中图标的css选择器，若找到，则用iconClassName替换找到的图标类名，否则在整个按钮区域使用className
| iconToggleStrategy     | append/replace          | append                         | iconClassName替换策略。<br>1. append: 在原有类名基础上增加<br>2. replace：完全使用新类名替换原类名
| duration               | number                  | 400                            | 动画时长(ms)


## 远程验证辅助类
自动读取data-debounce-time(如果有)，默认为300。在抖动时间内的重复请求，之前的请求订阅会被取消
```javascript
@Directive({
    selector: '[nameUnique]',
    providers: [
        { provide: NG_ASYNC_VALIDATORS, useExisting: NameUniqueDirective, multi: true }
    ]
})
export class NameUniqueDirective extends AsyncValidatorLimit implements AsyncValidator {

    constructor(private nameValidateService: NameValidateService,
                private ele: ElementRef) {
        super(ele);
    }

    validate(c: AbstractControl) {
        return super.limit(
            this.nameValidateService.isNameUnique(c.value).map(exist => {
                return exist ? { nameUnique: true } : null;
            })
        );
    }
}
```


## 内置的验证指令
- **trimmedRequired** - 去除左右空格后再验证非空


## 自定义错误处理组件
第一步：创建一个类并实现ErrorHandler接口
```javascript
export interface ErrorHandler {

    // 组件验证通过时调用
    whenValid(): void;

    // 组件验证不通过时调用
    whenInvalid(): void;

    // 窗口改变大小时调用(window.resize)，非必须
    reposition?(): void;

    // 组件销毁时释放资源，非必须
    destroy?(): void;
}

export class MyErrorHandlerConfig {
}

export class MyErrorHandler implements ErrorHandler {

    private config: MyErrorHandlerConfig;

    // 系统会自动创建该实例，并注入4个参数，可根据需要自行选择
    // $ele：与之想关的表单域/表单组jQuery对象
    // config：FormHelperConfig中定义的errorHandler参数，可能为空
    // control：与之想关的表单域/表单组控件
    // formConfig：完整的FormHelperConfig参数
    constructor(private $ele: JQuery,
                config: MyErrorHandlerConfig,
                private control: AbstractControl,
                private formConfig: FormHelperConfig) {
        // 在此定义默认参数
        this.config = {};
        
        // 用外部参数覆盖默认参数
        extend(this.config, config);
    }
    
    whenValid() {}
    
    whenInvalid() {}
}
```

第二步：注册错误处理组件
```javascript
FormHelperDirective.registerErrorHandler('myErrorHandlerName', MyErrorHandler);
```

第三步：使用
```javascript
<form [formHelper]="formConfig"></form>

// 带参
this.formConfig = {
    errorHandler: {
        name: 'myErrorHandlerName',
        config: {}
    }
};

// 不带参
this.formConfig = {
    errorHandler: 'myErrorHandlerName'
};
```


## 自定义提交处理组件
第一步：创建一个类并实现SubmitHandler接口
```javascript
export interface SubmitHandler {

    // 点击提交按钮时触发
    // 执行后会调用FormHelperConfig中定义的onSuccess方法
    start(): void;
    
    // 结束状态处理时触发
    // 在onSuccess之后调用，end执行完后调用FormHelperConfig中定义的onComplete方法
    end(): Promise | Observable | void;

    // 组件销毁时释放资源，非必须
    destroy?(): void;
}

export class MySubmitHandlerConfig {
}

export class MySubmitHandler implements SubmitHandler {

    private config: MySubmitHandlerConfig;
    
    // 系统会自动创建该实例，并注入2个参数，可根据需要自行选择
    // $ele：与之想关的表单域/表单组jQuery对象
    // config：FormHelperConfig中定义的submitHandler参数，可能为空
    constructor(private $ele: JQuery,
                config: MySubmitHandlerConfig) {
        // 在此定义默认参数
        this.config = {};
        
        // 用外部参数覆盖默认参数
        extend(this.config, config);
    }
    
    start() {}
    
    end() {}
}
```

第二步：注册提交处理组件
```javascript
FormHelperDirective.registerSubmitHandler('mySubmitHandlerName', MySubmitHandler);
```

第三步：使用
```javascript
<form [formHelper]="formConfig"></form>

// 带参
this.formConfig = {
    submitHandler: {
        name: 'mySubmitHandlerName',
        config: {}
    }
};

// 不带参
this.formConfig = {
    submitHandler: 'mySubmitHandlerName'
};
```



