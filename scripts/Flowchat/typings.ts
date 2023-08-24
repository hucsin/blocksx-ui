import { number } from "../former/types";

/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-09-23 09:55:44
 */
export type IProcessNodePosition = {
    type?: string;
    x: number;
    y: number;
}
export interface IProcess {
    id: any;
    type?: string;
    sync?: boolean; // 标记是否同步
    nodes: IProcessNode[];
    pipes: IProcessPipe[];
}
export interface IProcessPipe {
    name: string;               // 组件名
    type?: string;               // 组件类型
    description?: string;       // 描述

    source: string;             // 源节点  
    target: string;             // 目标节点

    props: {
        [prop: string]: any
    }
}
export interface IProcessNode {
    name: string;
    type: string;
    description?: string;
    isSubprocess?: boolean;
    props: {
        [prop: string]: any
    };
    children?: IProcess;          // 子流程
    ui?: IProcessNodePosition;
}