/**
 * 首页banner区域
 */
import React from 'react';
import classnames from 'classnames';

import { TablerUtils } from '@blocksx/ui';

import BoxManger from '../../BoxManger';
import './style.scss';

import { BoxItemBase } from '../../interface';

interface BoxBannerProps extends BoxItemBase {

}

export default class BoxBanner extends React.Component<BoxBannerProps> {
    public render() {
        let props: any = this.props;
        return (
            <div className={classnames({
                'box-banner': true
            })}>
                {props.title && <h1>{props.title}</h1>}
                {props.subtitle && <h2>{props.subtitle}</h2>}
                <p>{props.slogan}</p>
                {props.actions &&<div className='box-banner-actions'>{props.actions.map(it => {
                    return (
                        <a href={it.action} >{it.text}</a>
                    )
                })}</div> }
                {props.tags && <div className="box-banner-tags">{props.tags.map(it => {
                    return (
                        <span>
                            {it.icon && TablerUtils.renderIconComponent(it)}
                            {it.text}
                        </span>
                    )
                })}</div>}
                <div className='box-banner-media'>{props.image && <img  src={props.image}/>}</div>
            </div>
        )
    }
}
BoxManger.set('banner', BoxBanner);