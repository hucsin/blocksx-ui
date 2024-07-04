export interface IPointCoord {
    left: number;
    top: number;
}
export interface IRect extends IPointCoord {
    width: number;
    height: number;
}



export type FlowNodeType = 'go' | 'router' | 'module' | 'control' | 'empty';


export interface FlowConnector {
    source: string;
    target: string;
    isLock?: boolean;
    isTemporary?: boolean;
}

export interface FlowNode {
    name: string;
    type: FlowNodeType;
    left: number,
    top: number,
    color: string;
    node?: HTMLElement;
    isTemporary?: boolean;
    locked?: boolean;
    floating?: boolean;
}
