import React from 'react';

import { BoxItem } from '../../interface';
import { TablerUtils } from '@blocksx/ui';
import BoxManger from '../../BoxManger';
import './style.scss'

export default class BoxSwap extends React.Component<BoxItem> {
    public render() {
        let props: any = this.props;
        return (
            <div className="box-swap">
                <h2>{props.title}</h2>
                <p>{props.slogan}</p>
                <div className='box-swap-scrollBar' >
                    <div className='box-swap-inner'>
                        {props.items.map(it => {
                            return (
                                <a className='scrollbar-item'>
                                    <div>{TablerUtils.renderIconComponent(it)}</div>
                                    <h2>{it.title}</h2>
                                    <p>{it.slogan || it.description}</p>
                                </a>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

BoxManger.set('swap', BoxSwap);