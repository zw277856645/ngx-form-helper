## SubmitCallback

``` js
// 原型
export interface SubmitCallback {

    complete: (reset?: boolean) => void;

    reset: () => void;
}
```

- 作用：表单提交成功后的后续处理，包括表单重置和停止 `SubmitHandler` 处理（如果有）
- reset：表单重置方法
- complete：默认为停止 submitHandler 处理，如果传入参数 true，将同时重置表单

## RefType

``` js
// 原型
export type RefType = string | NgModel | NgModelGroup;
```

- 作用：错误信息关联的表单控件指引
- 可用格式
  - string：name | ngModelGroup | formControlName | formGroupName | formArrayName  
  - control：表单控件对象，通常为模板变量，如：#ctrl="ngModel | ngModelGroup"

控件名称方式
``` html
<!-- ngModel name -->
<input type="text" name="name" [(ngModel)]="xxx">
<eh-text ref="name"></eh-text>

<!-- ngModelGroup name -->
<div ngModelGroup="name"></div>
<eh-text ref="name"></eh-text>

<!-- formControlName name -->
<input type="text" formControlName="name">
<eh-text ref="name"></eh-text>

<!-- formGroupName / formArrayName name -->
<div formGroupName="name"></div>
<eh-text ref="name"></eh-text>
```

控件对象方式
``` html
<!-- ngModel control -->
<input type="text" name="name" [(ngModel)]="xxx" #ctrl="ngModel">
<eh-text [ref]="ctrl"></eh-text>

<!-- ngModelGroup control -->
<div ngModelGroup="name" #ctrl="ngModelGroup"></div>
<eh-text [ref]="ctrl"></eh-text>
```

> `控件对象方式`只适用于`ngModel`和`ngModelGroup`，因为`模型驱动`表单通常在根节点(form)构造整个控件树，子控件由
> formControlName、formGroupName、formArrayName 建立关联关系，所以`ref`使用第一种`控件名称`方式即可

