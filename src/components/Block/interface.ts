
export interface BlockTag {
    icon?: string;
    value?: string;
    label: string;

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


    tags?: BlockTag[];
    link?: [string, string]; // [redmine me , http://www.baidu.com/]
}


export interface BlockItem extends BlockItemBase {
    size?: 'large' | "middle" | "small",
    colspan?: number;
    layout?: "left" | "center",
    items?: BlockItemBase[];
}