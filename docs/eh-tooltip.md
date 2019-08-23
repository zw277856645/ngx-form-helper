## 概要

- 作用：标签形式的错误消息   
- 特色：绝对定位，所有错误消息同时展示，动态切换消息状态，异步验证有 loading 反馈

## 使用方式

消息内容为文本节点
``` html
<input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
<eh-tooltip ref="name">
  <eh-tooltip-message error="required">不能为空</eh-tooltip-message>
  <eh-tooltip-message error="pattern">请输入字符</eh-tooltip-message>
</eh-tooltip>
```

消息内容为 message 属性
``` html
<input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
<eh-tooltip ref="name">
  <eh-tooltip-message error="required" message="不能为空"></eh-tooltip-message>
  <eh-tooltip-message error="pattern" message="请输入字符"></eh-tooltip-message>
</eh-tooltip>
```

消息对象为 errorMessages 属性
``` html
<!-- 
// 有序
messages = [
    { error: "required", message: "不能为空" },
    { error: "pattern", message: "请输入字符" }
];

// 无序 - 字符串
// 此方式将不能定义 order、async、context
messages = {
    required: "不能为空",
    pattern: "请输入字符"
};

// 无序 - 对象
messages = {
    required: { message: "不能为空", order: 0, async: false, context: null },
    pattern: { message: "请输入字符", order: 0, async: false, context: null }
};
-->
<input type="text" name="name" [(ngModel)]="xxx" required pattern="[a-zA-Z]*">
<eh-tooltip ref="name" [errorMessages]="messages"></eh-tooltip>
```

## 输入属性

@Input() 装饰器标识的属性

### classNames

- 类型：`string`
- 默认值：`eh-tooltip-theme`

主题样式，指定的字符串会添加到组件所在元素类名中。可设置多个值，空格符分割。插件已为默认值定义了一套主题样式，可通过修改配置实现自定义主题

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

### position

- 类型：`TooltipPosition`
- 默认值：`BOTTOM_RIGHT`

提示相对表单域/表单组的位置

``` js
// 原型
export enum TooltipPosition {

    TOP_LEFT = 'top left', TOP_CENTER = 'top center', TOP_RIGHT = 'top right',

    BOTTOM_LEFT = 'bottom left', BOTTOM_CENTER = 'bottom center', BOTTOM_RIGHT = 'bottom right',

    RIGHT_CENTER = 'right center', LEFT_CENTER = 'left center'
}
```

### positionProxy

- 类型：`string`
- 默认值：`undefined`

错误消息定位代理。默认相对于表单域/表单组本身定位，可使用任意其他元素作为代理。代理元素必须`包含`在错误消息`直接父元素下`。
语法：参见 formHelper 的 [scrollProxy](form-helper#scrollproxy)

> PS：参照物为`关联的表单域/表单组`，而不是错误消息自身

### duration

- 类型：`number`
- 默认值：`200`

显示/隐藏动画时长(ms)，动画固定为 fade

### zIndex

- 类型：`number`
- 默认值：`1`

z-index 值

### errorMessages

- 类型：`TooltipMessage[] | { [ error: string ]: Message | string }`
- 默认值：`undefined`

``` js
// 原型
export class Message {

    // 验证不通过时显示的消息
    message: string;

    // 验证规则是否是异步
    // 异步有特定反馈动画，请正确设置
    async?: boolean;

    // 顺序
    order?: number;

    // 消息占位符被替换时的上下文环境
    // 全局通用消息在不同组件中使用时有用
    context?: any;
}

export class TooltipMessage extends Message {

    // 验证规则对应的名称
    error: string;
}
```

消息定义对象。可使用占位符，占位符使用的上下文环境是用户设定的 context 属性

> 与 eh-text 不同的是，eh-text 占位符上下文环境是`验证方法返回的错误体本身`，而 eh-tooltip 是`用户设定的 context 属性`，
> 之所以不能使用`验证方法返回的错误体本身`是因为 eh-tooltip 需要初始显示所有的错误消息，但含有占位符的消息仅当相应的
> `错误发生时`才能替换占位符

``` js
messages = {
    listRequired: '不能为空',
    listRequiredMin: { message: '至少设置{{value}}个值', context: { value: 2 } },
    listRequiredMax: { message: '至多设置{{value}}个值', context: { value: 4 } }
};
```

``` html
<input type="text" name="loves" [(ngModel)]="xxx" listRequired minListNum="2" maxListNum="4">
<eh-text ref="loves" [errorMessages]="messages"></eh-text>
```

## 公共成员方法

实例方法

### reposition

- 类型：`() => void`

错误消息重定位，插件自动调用，当出现插件无法跟踪的页面布局变化时，需要用户手动调用

> 当控件为`表单组`时也只重定位自身

``` html
<!-- 示例 - 重定位 -->
<textarea name="name" required autoSize (sizeChange)="nameCtrl.reposition()"></textarea>
<eh-tooltip ref="name" #nameCtrl="ehTooltip">
    <eh-tooltip-message error="required">不能为空</eh-tooltip-message>
</eh-tooltip>
```