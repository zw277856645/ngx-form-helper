/**
 * 自定义提交处理组件需要实现的接口
 */
export interface SubmitHandler {

    /**
     * 初始点击 submit 按钮时处理函数
     */
    start(): void;

    /**
     * 流程结束时处理函数
     *
     * @param cb 结束回调函数
     */
    end(cb?: () => void): void;

}