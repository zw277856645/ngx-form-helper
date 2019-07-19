## SubmitWrapper

``` js
// 原型
export type SubmitWrapper = (
    request?: Observable<any> | Promise<any> | ((...args: any[]) => Observable<any> | Promise<any> | any) | any
) => Observable<any>;
```

- 作用：连接请求与请求后续处理的桥梁
- 使用原因：以rxjs为例，请求通常写法为 request.subscribe(() => callback())，插件需要在 request 与 callback 之间插入一些操作，
借助 submitWrapper(request).subscribe(() => callback()) 实现功能
- 参数说明：请求为`异步`时，接收一个 Observable | Promise 或返回 Observable | Promise 的函数。
请求为`同步`时，接收一个任意值或返回任意值的函数

> PS：即使没有 request 只有 callback 的情况下也不能省略 submitWrapper，应写成 submitWrapper().subscribe(() => callback())。
> 因为 submitWrapper 中有许多插件内置操作，不能省略调用

请求为异步流示例
``` js
request(submitWrapper: SubmitWrapper) {
    // do something
    ...

    submitWrapper(this.userService.addOrUpdate(this.user)).subscribe(() => {
        // do something
        ...
    })
}
```

``` html
<form formHelper (validPass)="request($event)">
```

请求为异步函数示例
``` js
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
```

请求为同步值示例
``` js
request(submitWrapper: SubmitWrapper) {
    // do something
    ...

    submitWrapper().subscribe(() => {
        // do something
        ...
    })
}
```

请求为同步函数示例
``` js
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

