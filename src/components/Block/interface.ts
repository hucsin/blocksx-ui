
export interface BlockTag {
    icon?: string;
    text: string;

    link?: string;
}

export interface BlockBehavior {
    type: 'markdown' | 'link' | 'video' | 'router';
    title?: string;
    contentType?: 'icon' | 'avator' | 'default' | 'image' | 'video' ,
    content: string | Function;
    confirm?: string;
    href?: string;
    params?: any;
}

export interface BlockAction {
    text: string;
    icon?: string;
    size?: 'large' | 'small' | 'default',
    type?: 'primary' | 'default' | 'link' | 'dashed' | 'text';
    action: string;
    params?: any;
}

export type BlockValue = string | BlockBehavior;

export interface BlockItemBase {
    name?: string;
    title?: string; // 标题
    description?: string; // 描述
    type?: string;

    extra?: any;
    theme?: string;
    
    content?: string; // 内容
    markdown?: string; // 内容 markdown格式

    avatar?: BlockValue;
    icon?: BlockValue | BlockValue[]; 
    
    color?: string;
    
    image?: BlockValue; // 主图
    video?: BlockValue; // 视频

    actions?: BlockAction[];
    tags?: BlockTag[];
    link?: [string, string]; // [redmine me , http://www.baidu.com/]
}


export interface BlockItem extends BlockItemBase {
    size?: 'large' | "middle" | "small",
    colspan?: number;
    layout?: "left" | "center",
    events?: any;
    items?: BlockItemBase[];
}