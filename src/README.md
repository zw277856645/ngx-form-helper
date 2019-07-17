# ngx-form-helper
angular 表单验证辅助插件 for angular >= 6

## 插件特性
* 极简的使用方式，屏蔽 angular 验证底层细节
* 内置丰富的功能，如：自动滚动到第一个错误域、防重复提交、消息动画、隐藏域滚动代理、全局配置叠加等
* 内置两种使用最广泛的错误提示显示方式
* 丰富的参数配置，易于适配各种使用场景
* 可通过继承内置基类，仅仅实现个别接口实现自定义的错误提示方式
* template driven 和 model driven 表单都支持

## DEMO
<https://ngx-form-helper-demo.stackblitz.io>

## 安装
> npm install ngx-form-helper --save
>
> PS：请使用`3.0.0`及之后的版本

## 使用
#### 1. 引入module
``` js
import { FormHelperModule } from 'ngx-form-helper';

@NgModule({
    imports: [
        FormHelperModule
    ]
})
export class AppModule {
}
```

#### 2. 引入内置样式
如果使用 webpack 打包方式，在项目中第三方插件入口文件(通常为`vendor.ts`)中添加如下代码
``` js
// vendor.ts
import 'ngx-form-helper/ngx-form-helper.css';
```
``` js
// webpack.js
module.exports = {
    ...
    entry: {
        ...
        'vendor': './src/vendor.ts',
    }
    ...
}
```

如果使用的是 angular cli，在 angular.json 中引入样式文件
``` json
{
  ...
  "projects": {
    "app": {
      ...
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            ...
            "styles": [
              ...
              "node_modules/ngx-form-helper/ngx-form-helper.css"
            ]
          }
        }
      }
    }
  }
}
```

#### 3. 具体使用方式及效果请参见[demo](https://ngx-form-helper-demo.stackblitz.io)

## 配置文档

> 名词解释  
> 
> 表单域：指绑定了 ngModel、formControl、formControlName 中某一个指令的控件  
> 表单组：指绑定了 ngModelGroup、formGroup、formGroupName、formArray、formArrayName 中某一个指令的控件    
> 父域：指表单域/表单组的父控件。父域必定为表单组  
> 子域：指表单组的子孙控件。子域可能为表单域，也可能为表单组  
> 错误域：指验证失败的表单域或表单组  

#### 1. formHelper 指令配置（FormHelperConfig）
使用方法如下：
``` html
<form formHelper [autoReset]="false" (validPass)="request($event)" ...></form>
```

| `输入属性`配置项                 | 参数类型                                        | 默认值                | 说明 |
| :------------------------------- | :---------------------------------------------- | :-------------------- | :--- |
| autoReset                        | boolean                                         | true                  | `成功提交`后是否自动重置表单<br><br>**成功提交：指验证通过且提交回调函数`(resultOkAssertion)`执行也符合预期**
| context                          | window/ElementRef/Element/string                | window                | 表单所处上下文，通常为 window 或含有滚动条的对象，影响滚动条正确滚动到第一条错误。<br><br>当类型为 string 时，支持[css选择器](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Introduction_to_CSS/Selectors)和`点号表达式`<br><br>**点号表达式：语法：. => 当前元素，.. => 父元素，../../ etc**
| scrollProxy                      | string                                          |                       | 滚动代理<br><br>默认滚动到错误域本身，但当错误域本身处于不可见状态时，使用另一个可见对象作为代理。若没有设置滚动代理，且错误域本身不可见，会一直寻找其父域直到 ngForm (不包含)，使用第一个可见域作为代理<br><br>语法：^ => 父节点，~ => 前一个兄弟节点，+ => 后一个兄弟节点，可以任意组合<br>示例：^^^，^2，~3^4+2  
| autoScroll                       | boolean                                         | true                  | 是否自动滚动到第一个错误
| offsetTop                        | number                                          | 0                     | 滚动定位使用，错误域距离浏览器顶部偏移量。<br><br>默认滚动到第一个错误域与浏览器可视区域顶部重合处，但大多数情况下页面是有绝对定位(absolute)或固定定位(fixed)的头部的，此时会盖住滚动到此的错误域，通过设置 offsetTop 解决此问题
| validateImmediate                | boolean                                         | false                 | 设置表单域或表单组是否`初始`就显示错误<br><br>默认只在控件 dirty 状态触发错误显示，所以表单初始不会显示错误，当用户修改了表单或点提交按钮后才会显示错误
| validateImmediateDescendants     | boolean                                         | true                  | 设置`表单组`是否`初始`就显示其所有子域的错误<br><br>此配置在`validateImmediate = true`的条件下才有效，且只对`表单组`有效
| classNames                       | string/false                                    | fh-theme              | 表单域主题。指定的字符串会添加到form类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式，可通过修改配置实现自定义主题
| errorClassNames                  | string/false                                    | fh-error              | 验证失败时`表单域`自动添加的类名
| errorGroupClassNames             | string/false                                    | fh-group-error        | 验证失败时`表单组`自动添加的类名。默认主题没有为 fh-group-error 设置样式，用户可在自己的样式文件中定义具体样式
| resultOkAssertion                | (res: any) => boolean                           |                       | 判断请求是否成功的断言函数，res为请求返回值，仅当执行结果为 true 时，才会继续执行`SubmitWrapper 监听函数`和自动重置表单<br><br>默认根据请求状态码处理，200为请求成功，否则为失败。如果用户包装了请求响应，比如使用自定义状态码代表请求状态，需要使用此配置指定判断逻辑

| `输出属性`配置项 | 传递参数       | 说明 |
| :--------------- | :------------- | :--- |
| validFail        |                | 验证不通过
| validPass        | SubmitWrapper  | 验证通过

##### SubmitWrapper 说明
作用：连接请求与请求后续处理的桥梁  
原因：以rxjs为例，请求通常写法为 request.subscribe(() => callback())，插件需要在 request 与 callback 之间插入一些操作，借助 submitWrapper(request).subscribe(() => callback()) 实现功能  
说明：请求为`异步`时，接收一个 Observable / Promise 或返回 Observable / Promise 的函数。请求为`同步`时，接收一个任意值或返回任意值的函数

> PS：即使没有 request 只有 callback 的情况下也不能省略 submitWrapper，应写成 submitWrapper().subscribe(() => callback())。
> 因为 submitWrapper 中有许多插件内置操作，不能省略调用

``` js
// 原型
export type SubmitWrapper = (
    request?: Observable<any> | Promise<any> | ((...args: any[]) => Observable<any> | Promise<any> | any) | any
) => Observable<any>;
```

``` js
// 示例1 - 异步流
request(submitWrapper: SubmitWrapper) {
    // do something
    ...
    
    submitWrapper(this.userService.addOrUpdate(this.user)).subscribe(() => {
        // do something
        ...
    })
}

// 示例2 - 异步函数
request(submitWrapper: SubmitWrapper) {
    // do something
    ...
    
    submitWrapper(() => {
        // do something
        ...
        
        // 必须将异步流返回
        if (xxx) {
            return this.userService.add(this.user);
        } else {
            return this.userService.update(this.user);
        }
    }).subscribe(() => {
        // do something
        ...
    })
}

// 示例3 - 同步值
request(submitWrapper: SubmitWrapper) {
    // do something
    ...
    
    submitWrapper().subscribe(() => {
        // do something
        ...
    })
}

// 示例3 - 同步函数
request(submitWrapper: SubmitWrapper) {
    // do something
    ...
    
    submitWrapper(() => {
        // do something
        ...
    }).subscribe(() => {
        // do something
        ...
    })
}
```

##### 默认主题附加样式
``` html
<!-- 表单域添加 ignore 类，将忽略给该元素设置验证失败样式 -->
<input type="text" class="ignore" name="name" [(ngModel)]="xxx" required>

<!-- 表单域添加 thin 类，将设置元素左边框为细边框样式 -->
<input type="text" class="thin" name="name" [(ngModel)]="xxx" required>
```

#### 2. shLoader 指令配置（SubmitHandlerLoaderConfig）
主要作用：防重复提交和设定等待请求返回前的 loading 反馈  
使用方法如下：
``` html
<!-- 提交按钮在表单内部 -->
<form formHelper>
    <button type="button" shLoader>保存</button>
</form>

<!-- 提交按钮在表单外部 -->
<form formHelper #formHelperCtrl="formHelper"></form>
<button type="button" shLoader [refForm]="formHelperCtrl">保存</button>
```

| `输入属性`配置项         | 参数类型              | 默认值                  | 说明 |
| :----------------------- | :-------------------- | :---------------------- | :--- |
| classNames               | string                | sh-loader-theme         | 全局主题样式<br><br>指定的字符串会添加到指令所在元素类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式，可通过修改配置实现自定义主题
| iconClassNames           | string                | sh-loader-theme-icon    | 局部图标主题样式
| iconSelector             | string/false          | i.icon, i.fa            | 寻找图标的选择器，若找到，则使用`局部图标主题样式`，否则使用`全局主题样式`
| iconToggleStrategy       | APPEND/REPLACE        | APPEND                  | 图标类名的替换策略，append: 在原有类名基础上增加，replace: 完全使用新类名替换原类名
| duration                 | number                | 400                     | loader动画时长(ms)
| disableTheme             | boolean               | false                   | 是否禁用主题样式
| refForm                  | FormHelperDirective   |                         | 当 submit 元素在 form 外部时有用，使用此属性关联 formHelper 实例

如果不需要 shLoader 指令的功能，还可以使用为提交按钮添加 #submit 模板变量的方式
``` html
<form formHelper>
    <button type="button" #submit>保存</button>
</form>
```

## 全局data api
| 配置项                 | 参数类型 | 说明 |
| :--------------------- | :------- | :--- |
| validate-immediate     | boolean  | 覆盖FormHelperConfig中配置。使用方表单域/表单组
| debounce-time          | number   | 远程验证时使用，指定请求抖动时间。单位ms，使用方表单域/表单组。推荐使用AsyncValidatorLimit，详情参见远程验证辅助类章节
| scroll-proxy           | string   | 设置表单域/表单组滚动代理。<br><br>语法：^ -> 父节点，~ -> 前一个兄弟节点，+ -> 后一个兄弟节点，可以任意组合。<br>示例：\^\^\^，\^2，\~3\^4\+2


## 错误处理组件配置(ErrorHandlerTooltipConfig)
tooltip示例
``` html
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
``` html
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
``` js
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
``` js
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
``` js
FormHelperDirective.registerErrorHandler('myErrorHandlerName', MyErrorHandler);
```

第三步：使用
``` js
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
``` js
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
``` js
FormHelperDirective.registerSubmitHandler('mySubmitHandlerName', MySubmitHandler);
```

第三步：使用
``` js
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



