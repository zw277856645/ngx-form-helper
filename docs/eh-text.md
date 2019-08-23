## 概要

- 作用：文本形式的错误消息  
- 特色：当多个验证条件失败时，只显示其中一个错误消息，其他隐藏

## 使用方式

消息内容为文本节点
``` html
<input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
<eh-text ref="name">
  <eh-text-message error="required">不能为空</eh-text-message>
  <eh-text-message error="pattern">请输入字符</eh-text-message>
</eh-text>
``` 

消息内容为 message 属性
``` html
<input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
<eh-text ref="name">
  <eh-text-message error="required" message="不能为空"></eh-text-message>
  <eh-text-message error="pattern" message="请输入字符"></eh-text-message>
</eh-text>
```

消息对象为 errorMessages 属性
``` html
<!-- 
// 有序，优先显示排在前面的错误消息
messages = [
    { error: "required", message: "不能为空" },
    { error: "pattern", message: "请输入字符" }
];

// 无序，多个验证条件失败时，显示任意一个错误消息
messages = {
    required: "不能为空",
    pattern: "请输入字符"
};
-->
<input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
<eh-text ref="name" [errorMessages]="messages"></eh-text>
```

## 输入属性

@Input() 装饰器标识的属性

### classNames

- 类型：`string`
- 默认值：`eh-text-theme`

主题样式，指定的字符串会添加到组件所在元素类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式，可通过修改配置实现自定义主题

### inline

- 类型：`boolean`
- 默认值：`true`

错误文本是否使用行内样式，对应 display: inline / block

### fontSize

- 类型：`number`
- 默认值：`13`

字体大小

### offsetX

- 类型：`number`
- 默认值：`0`

x轴偏移，用来微调错误消息位置

### offsetY

- 类型：`number`
- 默认值：`0`

y轴偏移，用来微调错误消息位置

### float

- 类型：`boolean`
- 默认值：`false`

是否浮动，浮动时采用绝对定位

### right

- 类型：`boolean`
- 默认值：`false`

错误文本是否右对齐

### animation

- 类型：`fade | slideUp | slideDown | flyLeft | flyRight`
- 默认值：`undefined`

消息显示动画

### errorMessages

- 类型：`TextMessage[] | { [ error: string ]: string }`
- 默认值：`undefined`

``` js
// 原型
export class TextMessage {

    // 验证规则对应的名称
    error: string;

    // 验证不通过时显示的消息
    message: string;
}
```

消息定义对象。可使用占位符，占位符使用的上下文环境是验证方法返回的错误体本身

``` js
messages = {
    listRequired: '不能为空',
    listRequiredMin: '至少设置{{value}}个值',
    listRequiredMax: '至多设置{{value}}个值'
};
```

``` html
<!--
假如 model 数组长度少于2，则 minListNum 至少为2验证不成立，验证函数将返回 
{ listRequiredMin: { value: 2 } }，插件将使用该返回对象作为上下文环境替换占位符中匹配的字段
-->
<input type="text" name="loves" [(ngModel)]="xxx" listRequired minListNum="2" maxListNum="4">
<eh-text ref="loves" [errorMessages]="messages"></eh-text>
```
