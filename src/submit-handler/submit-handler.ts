import { Observable } from 'rxjs';

export interface SubmitHandler {

    // 初始点击submit按钮
    start(): void;

    // 表单请求结束
    end(): Promise<any> | Observable<any> | void;

}