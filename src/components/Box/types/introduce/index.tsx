
import React from 'react';
import classnames from 'classnames';

import { TablerUtils } from '@blocksx/ui';

import { BoxItem } from '../../interface';
import './style.scss'
import BoxManger from '../../BoxManger';


export default class BoxIntroduce extends React.Component<BoxItem> {
    public render() {
        let props: any = this.props;
        return (
            <div className={classnames({
                "box-introduce": true,
                [`box-introduce-theme-${this.props.theme}`]: this.props.theme
            })}>
                <div className='box-introduce-media'>
                    {props.image && <img src={props.image}/>}
                </div>
                <div className='box-introduce-desc'>
                    <h2>{props.title}</h2>
                    <p>{props.slogan}</p>
                    {props.actions &&<div className='box-actions'>{props.actions.map(it => {
                    return (
                        <a href={it.action} >{it.text}</a>
                    )
                })}</div> }
                </div>
            </div>
        )
    }
}

BoxManger.set('introduce', BoxIntroduce)