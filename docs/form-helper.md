## 概要

- 主要作用：插件的控制中心

## 使用方式

``` html
<form formHelper ...> ... </form>
```

## 输入属性

@Input() 装饰器标识的属性

### context

- 类型：`window | ElementRef | Element | string`
- 默认值：`window`

表单所处上下文，通常为 window 或含有滚动条的对象，影响滚动条正确滚动到第一条错误。当类型为 string 时，支持
[css选择器](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Introduction_to_CSS/Selectors) 和`点号表达式`

> 点号表达式语法：. => 当前节点，.. => 父节点，../../ etc

设置当前 form 元素为滚动对象
``` html
<form formHelper context="."></form>
```

设置当前 form `父`元素为滚动对象，本例指`id="parent"`的 div
``` html
<div id="parent">
  <form formHelper context=".."></form>
</div>
```

设置当前 form `祖先`元素为滚动对象，本例指`id="ancestor"`的 div
``` html
<div id="ancestor">
  <div id="parent">
    <form formHelper context="../../"></form>
  </div>
</div>
```

### autoScroll

- 类型：`boolean`
- 默认值：`true`

是否开启自动滚动到第一个错误域功能

### scrollProxy

- 类型：`string`
- 默认值：`undefined`

表单域/表单组的滚动代理。默认滚动到错误域本身，但当错误域本身处于不可见状态时，插件无法知道应该滚动到何处，此时可使用另一个可见对象作为代理。
若没有设置滚动代理，且错误域本身不可见，会默认寻找其父域直到 ngForm，使用第一个可见域作为代理

> 全局配置，可被表单域/表单组自身相同配置覆盖  
> 语法：^ => 父节点，~ => 前一个兄弟节点，+ => 后一个兄弟节点，可与数字任意组合，示例：^^^，^2，~3^4+2

### offsetTop

- 类型：`number`
- 默认值：`0`

滚动定位使用，错误域距离浏览器顶部偏移量。默认滚动到第一个错误域与浏览器可视区域顶部重合处，但大多数情况下页面是
有绝对定位(absolute)或固定定位(fixed)的头部的，此时会盖住滚动到此的错误域，通过设置 offsetTop 解决此问题

### validateImmediate

- 类型：`boolean`
- 默认值：`false`

设置表单域/表单组是否`初始`就显示错误。默认只在控件 dirty 状态触发错误显示，所以表单初始不会显示错误，
当用户修改了表单或点提交按钮后才会显示错误

> 全局配置，可被表单域/表单组自身相同配置覆盖

### validateImmediateDescendants

- 类型：`boolean`
- 默认值：`true`

设置`表单组`是否`初始`就显示其所有`子域`的错误。此配置仅在`全局(formHelper) validateImmediate = false`和
`表单组自身 validateImmediate = true`的条件下才有效，且只对`表单组`有效

> 全局配置，可被表单域/表单组自身相同配置覆盖

如下示例，group 控件自身验证状态变化时，会同时触发所有子域的验证
``` html
<form formHelper [validateImmediate]="false" [validateImmediateDescendants]="true">
  <div ngModelGroup="group" ehSimple [validateImmediate]="true">
    ...
  </div>
</form>
```

如下示例，group 控件自身验证状态变化时，`不会`同时触发所有子域的验证
``` html
<form formHelper [validateImmediate]="false">
  <div ngModelGroup="group" ehSimple [validateImmediate]="true" [validateImmediateDescendants]="false">
    ...
  </div>
</form>
```

### classNames

- 类型：`string`
- 默认值：`fh-theme`

表单域主题。指定的字符串会添加到 form 类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式，可通过修改配置实现自定义主题

### errorClassNames

- 类型：`string`
- 默认值：`fh-error`

验证失败时`表单域`自动添加的类名

### errorGroupClassNames

- 类型：`string`
- 默认值：`fh-group-error`

验证失败时`表单组`自动添加的类名。默认主题没有为 fh-group-error 设置样式，用户可在自己的样式文件中定义具体样式

## 输出属性

@Output() 装饰器标识的属性

### validFail

- 类型：`EventEmitter<void>`

验证不通过事件

### validPass

- 类型：`EventEmitter<SubmitCallback>`

验证通过事件。事件会传递[`SubmitCallback`](appendix#submitCallback)对象

## 公共成员属性

实例属性

### ngForm

- 类型：`ControlContainer`

关联的 angular form 实例，`模板驱动`表单(template driven form)时为 NgForm，`模型驱动`表单(Model driven form)时为 FormGroup。
ControlContainer 为两者共同基类

### form

- 类型：`HTMLFormElement`

表单的 dom 元素

### controls

- 类型：`{ [key: string]: AbstractControl }`

控件树，屏蔽了模板驱动和模型驱动表单之间的差异

## 公共成员方法

实例方法

### submit

- 类型：`(submitCallback?: SubmitCallback) => void`
  - submitCallback：详情参见[`SubmitCallback`](appendix#submitCallback)章节文档

提交处理函数，不需要用户调用，通常在实现自定义的提交处理指令时需要

### reset

- 类型：`() => void`

重置，在重置按钮使用了`#reset`模板变量时可省略调用
``` html
<form formHelper>
    <button type="button" #reset>重置</button>
</form>
```

绑定事件方式
``` html
<form formHelper #formHelperCtrl="formHelper">
    <button type="button" (click)="formHelperCtrl.reset()">重置</button>
</form>
```

### repositionMessages

- 类型：`(type?: RefType | AbstractControl, delay?: number)`
  - type：需要重定位错误信息关联的表单控件指引，当控件为`表单组`时，其`子域`也会同时重定位。详情参见
  [`RefType`](appendix#reftype)章节文档。省略参数将重定位所有错误消息
  - delay：延时重定位时间，默认不延时

重定位错误消息。页面布局变化时，某些绝对定位错误消息位置可能需要重新定位。window:resize 事件已被插件处理，
会自动重定位错误消息，其他情况需要手动调用此方法。

``` html
<!-- 示例 -->
<form formHelper #formHelperCtrl="formHelper">
  <div ngModelGroup="group">
    ...
  </div>
  <button type="button" (click)="formHelperCtrl.repositionMessages('group')">重定位消息</div>
</form>
```

## 主题附加样式

表单域添加`ignore`类，将忽略给该元素设置验证失败样式
``` html
<input type="text" class="ignore" name="name" [(ngModel)]="xxx" required>
```

表单域添加`thin`类，将设置元素左边框为细边框样式
``` html
<input type="text" class="thin" name="name" [(ngModel)]="xxx" required>
```
