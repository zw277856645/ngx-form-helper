## 概要

- 主要作用：防重复提交和设定等待请求返回前的 loading 反馈

## 使用方式

``` html
<form formHelper>
  <button type="button" shLoader> ... </button>
</form>
```

如果不需要 shLoader 指令的功能，还可以使用为提交按钮添加`#submit`模板变量的方式
``` html
<form formHelper>
    <button type="button" #submit>保存</button>
</form>
```

## 输入属性

@Input() 装饰器标识的属性

### classNames

- 类型：`string`
- 默认值：`sh-loader-theme`

全局主题样式。指定的字符串会添加到指令所在元素类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式，
可通过修改配置实现自定义主题

### iconClassNames

- 类型：`string`
- 默认值：`sh-loader-theme-icon`

局部图标主题样式

### iconSelector

- 类型：`string`
- 默认值：`i.icon, i.fa`

寻找图标的选择器，若找到，则使用`局部图标主题样式`，否则使用`全局主题样式`

### iconToggleStrategy

- 类型：`APPEND | REPLACE`
- 默认值：`APPEND`

图标类名的替换策略，append: 在原有类名基础上增加，replace: 完全使用新类名替换原类名

### disableTheme

- 类型：`boolean`
- 默认值：`false`

是否禁用主题样式

### refForm

- 类型：`FormHelperDirective`
- 默认值：`false`

当 submit 元素在 form 外部时有用，使用此属性关联 formHelper 实例

提交按钮在表单内部
``` html
<form formHelper>
    <button type="button" shLoader>保存</button>
</form>
```

提交按钮在表单外部
``` html
<form formHelper #formHelperCtrl="formHelper"></form>
<button type="button" shLoader [refForm]="formHelperCtrl">保存</button>
```