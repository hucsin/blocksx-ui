
export interface BoxTag {
    icon?: string;
    text: string;

    link?: string;
}

export interface BoxBehavior {
    type: 'markdown' | 'link' | 'video' | 'router';
    title?: string;
    contentType?: 'icon' | 'avatar' | 'default' | 'image' | 'video' ,
    content: string | Function;
    confirm?: string;
    href?: string;
    params?: any;
}

export interface BoxAction {
    text: string;
    icon?: string;
    link?: string;
    color?: string;
    tooltip?: string;
    size?: 'large' | 'small' | 'default',
    type?: 'primary' | 'default' | 'link' | 'dashed' | 'text' | 'qrcode';
    action: string;
    params?: any;
}

export type BoxValue = string | BoxBehavior;

export interface BoxItemBase {
    name?: string;
    value?: any;
    label?: string;
    main?: boolean;
    subtitle?: string;
    title?: string | {
        prefix?: string;
        scrolling?:string[];
        suffix?:string
    }; // 标题
    slogan?: string;
    price?: number;
    description?: string; // 描述
    type?: string;

    extra?: any;
    theme?: string;
    
    content?: string; // 内容
    markdown?: string; // 内容 markdown格式

    avatar?: BoxValue;
    icon?: BoxValue | BoxValue[]; 
    
    color?: string;
    
    image?: BoxValue | BoxValue[]; // 主图
    video?: BoxValue; // 视频

    actions?: BoxAction[];
    tags?: BoxTag[];
    link?: [string, string]; // [redmine me , http://www.baidu.com/]
}


export interface BoxItem extends BoxItemBase {
    size?: 'large' | "middle" | "small",
    colspan?: number;
    layout?: "left" | "center",
    type?: string;
    events?: any;
    motion?: any;
    fontSize?: string;
    content?: string;
    features?: any;
    plans?: any;
    
    items?: BoxItemBase[];
}