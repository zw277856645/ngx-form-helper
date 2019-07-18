# ngx-form-helper
angular 表单验证辅助插件 for angular >= 6

## ✨ 插件特性
- 极简的使用方式，屏蔽 angular 验证底层细节
- 内置丰富的功能，如：自动滚动到第一个错误域、防重复提交、消息动画、隐藏域滚动代理、全局配置叠加等
- 内置两种使用最广泛的错误提示显示方式
- 丰富的参数配置，易于适配各种使用场景
- 可通过继承内置基类，仅仅实现个别接口实现自定义的错误提示方式
- template driven 和 model driven 表单都支持

## 🔗 链接
- [DOCS](https://zw277856645.gitlab.io/ngx-form-helper)
- [DEMO](https://ngx-form-helper-demo.stackblitz.io)

## 📦 安装
> npm install ngx-form-helper --save
>
> PS：请使用`3.0.0`及之后的版本

## 🔨 使用
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
