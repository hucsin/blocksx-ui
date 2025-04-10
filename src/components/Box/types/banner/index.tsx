/**
 * 首页banner区域
 */
import { utils } from '@blocksx/core';
import React from 'react';
import classnames from 'classnames';
import TablerUtils from '../../../utils/tool'
import TextLoop from "react-text-loop";
import BoxManger from '../../BoxManger';
import './style.scss';
import { Popover } from 'antd';
import { QRCodeCanvas } from 'qrcode.react';

import { BoxItemBase } from '../../interface';

interface BoxBannerProps extends BoxItemBase {
    
}

export default class BoxBanner extends React.Component<BoxBannerProps> {
    private renderQRcode(qrcode: string, item:any) {
        return (
            <div className='qrcode banner-popover'>
                <QRCodeCanvas size={200} level="M" value={qrcode} />
                <div className='icon' style={{color: item.color}}> {TablerUtils.renderIconComponent(item)}</div>
                <p>{item.tooltip}</p>
            </div>
        )
    }
    public render() {
        let props: any = this.props;
        return (
            <div className={classnames({
                'box-banner': true
            })}>
                {props.title && <h1>{this.renderTitle(props.title)}</h1>}
                {props.subtitle && <h2>{props.subtitle}</h2>}
                <p>{props.slogan || props.description}</p>
                {props.actions &&<div className='box-banner-actions'>{props.actions.map(it => {
                    // qrcode
                    if (it.type == 'qrcode') {
                        return (
                            <Popover
                                rootClassName='banner-popover'
                                content={this.renderQRcode(it.action, it)}
                            >
                                <a>{it.text}</a>
                            </Popover>
                        )
                    }
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
    private renderTitle(title: any) {
        if (utils.isPlainObject(title)) {
            return (
                <>
                    {title.prefix}
                    {title.scrolling && <TextLoop springConfig={{ stiffness: 70, damping: 31 }} adjustingSpeed={300}>{title.scrolling.map(it=> <span>{it}</span>)}</TextLoop>}
                    {title.suffix}
                </>
            )
        } else {
            return title;
        }
    }
}
BoxManger.set('banner', BoxBanner);