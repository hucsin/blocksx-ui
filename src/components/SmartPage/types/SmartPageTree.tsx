import React from 'react';

interface SmartPageTreeProps {
    schema: any;
    pageMeta: any;
    path: string;
    mode: 'default' | 'tree';

    viewer?: boolean;

}
interface SmartPageTreeState {

}
/**
 * tree 视图
 * 两种试图,
 * 视图1: 左边是tree,右边是表单的场景, default 
 * 视图2: 左边是tree,右边没有任何东西,tree上面带右键菜单
 * 
 * 都是直接查找出字段信息,然后做
 */

export default class SmartPageTree extends React.Component<SmartPageTreeProps, SmartPageTreeState> {

    public static defaultProps = {
        mode: 'default',

        viewer: false,
        
    }
    private fields: any;
    public constructor(props: SmartPageTreeProps) {
        super(props);

        let schema: any = props.schema || {};
        
        this.fields = schema.fileds;
    }

    public render() {

        return (
            <div className=''>

            </div>
        )
    }
}