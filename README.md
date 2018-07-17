# ngx-form-helper
angular2表单验证辅助插件


## 安装
> npm install ngx-form-helper --save


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
> note：ngx-form-helper.css中引入了完整的animate.css


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

| 配置项                 | 参数类型                                                   | 默认值                | 说明 |
| :--------------------- | :--------------------------------------------------------- | :-------------------- | :--- |
| autoReset              | boolean                                                    | true                  | 成功提交后是否自动重置表单 
| validateImmediate      | boolean                                                    | false                 | 默认只在控件dirty状态触发，设置为true可立即触发验证。<br><br>可被表单域/表单组的data api配置覆盖
| context                | window/selector                                            | window                | 表单所处上下文，通常为window或含有滚动条的对象，影响滚动条正确滚动到第一条错误。<br><br>支持点号表达式：. -> 当前form，.. -> 父元素，../../ etc
| extraSubmits           | selector                                                   |                       | 额外的提交按钮选择器。默认查找当前form下的type=submit的按钮。<br><br>若触发提交的按钮在form外部，或其他形式的提交按钮(如div)可设置此参数指定
| autoScroll             | boolean                                                    | true                  | 是否自动滚动到第一个错误。<br><br>当表单域不可见时，自动寻找包含该元素的表单组，不可见继续寻找直到ngForm(不包含)，以此元素为定位对象。<br><br>若通过data api设置了滚动代理，则以滚动代理为优先定位对象。详情参见data-scroll-proxy语法
| offsetTop              | number                                                     | 0                     | 错误定位使用，错误项距离浏览器顶部偏移量，负数向上，正数向下。通常设置为position:fixed的head高度
| className              | string/false                                               | fh-theme-default      | 表单域主题。指定的字符串会添加到form类名中。可修改默认值实现自定义主题
| errorClassName         | string/false                                               | fh-error              | 验证失败时表单域自动添加的类名
| errorGroupClassName    | string/false                                               | fh-group-error        | 验证失败时表单组自动添加的类名
| errorHandler           | string/false/{name:string; config?:{[key: string]:any;}}   | tooltip               | 错误提示处理组件。<br>1. false：不使用错误处理组件<br>2. string：表示处理组件的名称<br>3. object：name表示处理组件的名称，config表示配置参数，覆盖组件中的默认参数
| submitHandler          | string/false/{name:string; config?:{[key: string]:any;}}   | loader                | 表单验证通过后，提交请求到请求结束之间状态的处理。<br>1. false：不使用提交处理组件<br>2. string：表示提交处理组件的名称<br>3. name表示提交处理组件的名称，config表示配置参数，覆盖组件中的默认参数
| onSuccess              | function                                                   |                       |
| onComplete             | function                                                   |                       |
| onDeny                 | function                                                   |                       |






