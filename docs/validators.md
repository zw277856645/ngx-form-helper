## trimmedRequired

- 主要作用：验证是否为空。同 angular 自带的 required 区别是本规则剔除空白符  
- 适用对象：表单域  
- 验证失败时返回：`{ trimmedRequired: true }`  

模板驱动
``` html
<input type="text" name="name" [(ngModel)]="xxx" trimmedRequired>
```

模型驱动
``` html
<!-- 
// xxx.component.ts
name = new FormControl('', [ trimmedRequired ]);
-->
<input type="text" name="name" formControlName="name">
```

## listRequired

- 主要作用：验证数组长度在 minListNum ~ maxListNum 之间  
- 适用对象：表单域  
- 验证失败时返回
  - 数组不存在或长度为0时返回：`{ listRequired: true }`
  - minListNum：数组最小长度，非必填，失败返回 `{ listRequiredMin: { value: xxx } }`
  - maxListNum：数组最大长度，非必填，失败返回 `{ listRequiredMax: { value: xxx } }`
  
模板驱动
``` html
<input type="text" name="name" [(ngModel)]="xxx" listRequired minListNum="2" maxListNum="4">
```

模型驱动
``` html
<!-- 
// xxx.component.ts
name = new FormControl('', [ listRequired({ minListNum: 2, maxListNum: 4 }) ]);
-->
<input type="text" name="name" formControlName="name">
```

## checkboxRequired

- 主要作用：验证某表单组下的多选框(checkbox)勾选数量在 minCheckedNum ~ maxCheckedNum 之间   
- 适用对象：表单组  
- 验证失败时返回
  - 勾选数量为0时返回：`{ checkboxRequired: true }`
  - minCheckedNum：勾选数量最小值，非必填，失败返回 `{ checkboxRequiredMin: { value: xxx } }`
  - maxCheckedNum：勾选数量最大值，非必填，失败返回 `{ checkboxRequiredMax: { value: xxx } }`

模板驱动
``` html
<div ngModelGroup="group" checkboxRequired minCheckedNum="2" maxCheckedNum="4">
    <!-- checkboxes -->
    ...
</div>

模型驱动
<!-- 
// xxx.component.ts
group = new FormGroup([ ... ], [ checkboxRequired({ minCheckedNum: 2, maxCheckedNum: 4 }) ]);
-->
<div ngModelGroup="group" formGroup="group">
    <!-- checkboxes -->
    ...
</div>
```