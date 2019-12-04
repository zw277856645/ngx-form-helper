## 提交处理组件（SubmitHandler）

``` js
// 原型
export interface SubmitHandler {

    // 初始点击submit按钮
    start(): void;
    
    // 请求中，可设定一定的最小持续时间，防止请求过快，loading 动画闪烁
    progressing(): Promise<any> | Observable<any> | void;

    // 流程结束
    complete(): void;
}

// 自定义提交处理组件
export class SubmitHandlerXxxDirective implements SubmitHandler {
    
    start() {
        // do something
    }
    
    progressing() {
        // do something
    }
    
    complete() {
        // do something
    }
}
```

## 消息处理组件（ErrorHandler）

ErrorHandler 为抽象类，内部已实现功能如下：
- 根据 ref 输入属性自动关联表单域/表单组
- 关联表单域/表单组成功后触发 onControlPrepared 回调，该回调由继承类实现
- 自带 scrollProxy、validateImmediate、validateImmediateDescendants 输入属性，并覆盖 formHelper 中相应属性
- 监听控件状态，自动触发 whenValid、whenInvalid、whenPending 回调，这些回调由继承类实现
- 继承类如果实现了 reposition 回调，插件会在 window:resize 事件中自动调用
- 内置 hasError(error:string) => ValidationErrors | null 方法，简化错误判断
- 内置 compileMessage(context: any, message: string) => string 方法，根据指定上下文替换消息中的占位符

| 可能需要实现的接口         | 说明 |
| :----------------------- | :--- |
| whenValid                | 验证成功回调
| whenInvalid              | 验证失败回调
| whenPending              | 处于验证中时的回调
| reposition               | 消息定位，通常在每次 whenInvalid 时调用一次，防止页面布局变化导致绝对定位消息显示位置不准确。window:resize 事件自动调用
| onControlPrepared        | 消息处理组件关联表单域/表单组是由基类自动完成的，可根据需要在关联成功后执行一些操作

> ErrorHandler 中实现了 AfterViewInit, OnInit 接口，如果自定义消息处理组件也需要实现相应接口，需要正确调用基类接口

``` js
// 自定义消息处理组件
export class ErrorHandlerXxxComponent extends ErrorHandler implements AfterViewInit, OnInit {
    
    ngOnInit() {
        super.ngOnInit();
        
        // do something
    }
    
    ngAfterViewInit() {
        super.ngAfterViewInit();
        
        // do something
    }
    
    whenValid() {
        // do something
    }
    
    whenInvalid() {
        // do something
    }
    
    whenPending() {
        // do something
    }
    
    reposition() {
        // do something
    }
    
    onControlPrepared() {
        // do something
    }
}
```