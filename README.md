# ngx-form-helper
angular 表单验证辅助插件

## ✨ 插件特性
- 极简的使用方式，屏蔽 angular 验证底层细节
- 内置丰富的功能，如：自动滚动到第一个错误域、防重复提交、消息动画、隐藏域滚动代理、全局配置叠加等
- 内置两种使用最广泛的错误提示显示方式
- 丰富的参数配置，易于适配各种使用场景
- 可通过继承内置基类，仅仅实现个别接口实现自定义的错误提示方式
- template driven 和 model driven 表单都支持

## 🔗 链接
- [DOCS](https://zw277856645.gitlab.io/ngx-form-helper)
- [DEMO](https://zw277856645.gitlab.io/ngx-form-helper/components/FormHelperDirective.html#example)
- [PROJECT](https://gitlab.com/zw277856645/ngx-form-helper)

## 📦 安装
> npm install @demacia/ngx-form-helper --save

## 🔨 使用
#### 1. 引入module

``` js
import { FormHelperModule } from '@demacia/ngx-form-helper';

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
import '@demacia/ngx-form-helper/ngx-form-helper.css';
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
              "node_modules/@demacia/ngx-form-helper/ngx-form-helper.css"
            ]
          }
        }
      }
    }
  }
}
```

#### 3. 使用方式

``` html
<!-- example.component.html -->
<form formHelper (validPass)="save($event)">
  <!-- tooltip 形式 -->
  <div class="field">
     <label>URL</label>
     <input type="text" name="url" [(ngModel)]="url" required urlValidator>
     <eh-tooltip ref="url">
       <eh-tooltip-message error="required">不能为空</eh-tooltip-message>
       <eh-tooltip-message error="urlValidator">URL格式错误</eh-tooltip-message>
     </eh-tooltip>
   </div>
   
  <!-- 文本形式 -->
  <div class="field">
    <label>ADDRESS</label>
    <div class="ui input">
      <input type="text" name="addr" [(ngModel)]="age" required pattern="^\d*$">
    </div>
    <!-- 错误消息可放置在 form 内任意位置，ref 属性关联对应的表单域即可 -->
    <eh-text ref="addr" animation="flyLeft">
      <eh-text-message error="required">不能为空</eh-tooltip-message>
      <eh-text-message error="pattern">请输入数字</eh-tooltip-message>
    </eh-tooltip>
  </div>
  
  <!-- shLoader 带有 loading 反馈，防重复提交等功能，推荐使用此方式 -->
  <button type="button" shLoader>保存</button>
  <!-- 或 -->
  <button type="button" #submit>保存</button>
</form>
```

``` js
\@Component({
    templateUrl: './example.component.html'
})
export class ExampleComponent {

    url: string;
    addr: string;
    
    constructor(private exampleService: ExampleService) {
    }

    save(submitCallback: SubmitCallback) {
        this.exampleService.save(this.url, this.addr).subscribe(res => {
            // do something
            ...
            
            // 固定写法，插件收尾处理
            submitCallback.complete();
        });
    }

}
```

## 🎨 主要部件导航

**控制中心**
- [FormHelperDirective](directives/FormHelperDirective.html)

**错误处理**
- [ErrorHandlerTextComponent](components/ErrorHandlerTextComponent.html)
- [ErrorHandlerTooltipComponent](components/ErrorHandlerTooltipComponent.html)
- [ErrorHandlerSimpleDirective](directives/ErrorHandlerSimpleDirective.html)

**提交按钮处理**
- [SubmitHandlerLoaderDirective](directives/SubmitHandlerLoaderDirective.html)

**内置验证器**
- [CheckboxRequiredDirective](directives/CheckboxRequiredDirective.html)
- [ListRequiredDirective](directives/ListRequiredDirective.html)
- [TrimmedRequiredDirective](directives/TrimmedRequiredDirective.html)

## ❓名词解释

#### 表单域
指绑定了 ngModel、formControl、formControlName 中某一个指令的控件

#### 表单组
指绑定了 ngModelGroup、formGroup、formGroupName、formArray、formArrayName 中某一个指令的控件

#### 父域
指表单域/表单组的父控件。父域必定为表单组

#### 子域
指表单组的子孙控件。子域可能为表单域，也可能为表单组

#### 错误域
指验证失败的表单域或表单组
