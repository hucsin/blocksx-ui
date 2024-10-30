import React from 'react';
import './style.scss'
import { Dropdown } from 'antd';
import * as Icons from '../../../../../Icons';
import TablerUtils from '../../../../../utils/tool';

interface DialogueEfficiencyProps {
    dataSource: any[];
    onSubmit: (assistant: any) => void;
}

export default class DialogueEfficiency extends React.Component<DialogueEfficiencyProps> {
    render() {
        return (<div className='dialogue-efficiency'>
            <div className='title'><Icons.EfficiencyUtilityOutlined/> You can get started quickly:</div>
            {this.props.dataSource.map((it, index) => (
                <Dropdown 
                    arrow
                    placement={'topRight'}
                    menu={{
                        items: it.children,
                        onClick: ({item}:any) => {
                            this.props.onSubmit(item.props.assistant);
                        }
                    }}
                >
                    <div className='item' key={index}>
                        {TablerUtils.renderIconComponent({icon: it.icon})} {it.label} {it.children && TablerUtils.renderIconComponent({icon: 'UpMiniDirectivityOutlined'})}
                    </div>
                </Dropdown>
            ))}
        </div>)
    }
}