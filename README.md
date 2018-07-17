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
```html
<form [formHelper]="config"></form>
```

`selector = string | JQuery | HTMLElement`

| 配置项                 | 参数类型                                                   | 默认值                | 说明 |
| :--------------------- | :--------------------------------------------------------- | :-------------------- | :-   |
| autoReset              | boolean                                                    | true                  | 成功提交后是否自动重置表单
| validateImmediate      | boolean                                                    | false                 | 默认只在控件dirty状态触发，设置为true可立即触发验证。<br>可被表单域/表单组的data api配置覆盖
| context                | window/selector                                            | window                |
| extraSubmits           | selector                                                   |                       |
| autoScroll             | boolean                                                    | true                  |
| offsetTop              | number                                                     | 0                     |
| className              | string/false                                               | fh-theme-default      |
| errorClassName         | string/false                                               | fh-error              |
| errorGroupClassName    | string/false                                               | fh-group-error        |
| errorHandler           | string/false/{name:string; config?:{[key: string]:any;}}   | tooltip               |
| submitHandler          | string/false/{name:string; config?:{[key: string]:any;}}   | loader                |
| onSuccess              | function                                                   |                       |
| onComplete             | function                                                   |                       |
| onDeny                 | function                                                   |                       |






