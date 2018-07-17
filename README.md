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

| 配置项                 | 参数类型 | 默认值 | 说明 |
| :--------------------- | :---     | :---   | :-   |
| autoReset              | boolean
| validateImmediate      | boolean
| context                | window/selector
| extraSubmits           | selector
| autoScroll             | boolean
| offsetTop              | number | 0
| className              | string | false | fh-theme-default
| errorClassName         | string | false | fh-error
| errorGroupClassName    | string | false | fh-group-error
| errorHandler           | string | false | { name: string; config?: { [key: string]: any; } }
| submitHandler          | string | false | { name: string; config?: { [key: string]: any; } }
| onSuccess              | function
| onComplete             | function
| onDeny                 | function






