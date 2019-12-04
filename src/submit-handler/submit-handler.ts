import { Observable } from 'rxjs';

export interface SubmitHandler {

    // 初始点击submit按钮
    start(): void;

    // 请求中，可设定一定的最小持续时间，防止请求过快，loading 动画闪烁
    progressing(): Promise<any> | Observable<any> | void;

    // 流程结束
    complete(): void;

}