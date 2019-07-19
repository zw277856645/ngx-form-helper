## 使用场景

假如有如下组件树，在组件自身和其任意祖先模块中定义了全局配置
``` mermaid
graph LR
A[Root Module<br>config1] --> B[Child Module A<br>config2]
B --> C[Child Module B<br>config3]
C --> D[Some Component<br>config4]
```
最终插件得到的`全局配置` = extend({}, config1, config2, config3, config4);

> 指令/组件自身的`输入属性配置`优先级永远`大于全局配置`  

## formHelper 全局配置

``` js
// 示例
@NgModule({
    ...
    providers: [
        ...
        formHelperConfigProvider({
            autoReset: false,
            offsetTop: 100
            ...
        })
    ]
})
export class XxxModule {
}
```

## shLoader 全局配置

``` js
// 示例
submitHandlerLoaderConfigProvider({
    duration: 300
    ...
})
```

## eh-text 全局配置

``` js
// 示例
errorHandlerTextConfigProvider({
    animation: 'flyLeft'
    ...
})
```

## eh-tooltip 全局配置

``` js
// 示例
errorHandlerTooltipConfigProvider({
    fontSize: 14
    ...
})
```

## ehSimple 全局配置

``` js
// 示例
errorHandlerSimpleConfigProvider({
    errorClassNames: 'eh-simple-error my-special-style'
    ...
})
```

