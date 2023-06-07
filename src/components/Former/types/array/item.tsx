import React from 'react';

import { IFormerBase } from '../../typings';
import { CloseCircleOutlined } from '@ant-design/icons';

interface IFormerArrayItem extends IFormerBase {
    index: number;
    onArrayItemRemove: Function;
}

export default class FormerArrayItem extends React.Component<IFormerArrayItem, {}> {
    public constructor(props: IFormerArrayItem) {
        super(props);
    }
    // 删除项
    private onArrayItemRemove =()=> {
        if (this.props.onArrayItemRemove) {
            this.props.onArrayItemRemove(this.props.index);
        }
    }
    public render() {
        return (
            <div className="former-array-item">
                {this.props.children}
                <div className="former-array-item-remove" onClick={this.onArrayItemRemove}><CloseCircleOutlined/></div>
            </div>
        )
    }
}