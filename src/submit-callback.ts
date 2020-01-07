export interface CompleteConfig {

    /**
     * 是否需要重置
     */
    reset?: boolean;

    /**
     * 延时执行时间，默认延后一个周期，设置为 false 禁用异步
     */
    delay?: number | false;
}

/**
 * 表单提交成功后的后续处理，包括`表单重置`和`停止 SubmitHandler` 处理
 */
export type SubmitComplete = (config?: CompleteConfig) => void;