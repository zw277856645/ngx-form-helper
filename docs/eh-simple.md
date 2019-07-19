## 概要

- 作用：标记任意元素为错误处理控件  
- 特色：没有错误消息，仅被标记的控件自身和对应的表单域/表单组有反馈  

## 使用方式

作用在任意元素，引用表单域/表单组。此方式与 eh-text / eh-tooltip 相同
``` html
<input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
<div ehSimple ref="name"></div>
```

作用在表单域/表单组上，此情况不需要设置 ref 属性
``` html
<input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*" ehSimple>
```

## 输入属性

@Input() 装饰器标识的属性

### errorClassNames

- 类型：`string | false`
- 默认值：`eh-simple-error`

验证失败时自身自动添加的类名

## 公共成员方法

实例方法

### repositionMessages

- 类型：`(delay?: number) => void`
  - delay：延时重定位时间，默认不延时

错误消息重定位，当关联控件为`表单组`时，其`子域`也会同时重定位

