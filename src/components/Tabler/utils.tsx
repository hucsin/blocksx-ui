import React from 'react';
import { utils } from '@blocksx/core';
import * as FormerTypes from '../Former/types';
import * as Icons from '../Icons';

export default class TablerUtils {
    public static renderIconComponent(field: any) {
        if (field.icon && Icons[field.icon]) {
            let UIView: any = Icons[field.icon];
            return <UIView key={field.key|| field.icon}/>
        }
    }
    public static renderComponentByField(field: any, props: any,  defaultComponent?: any) {
        // 当当前字段是存在action的时候
        //if (field.action) {
            let uiType: string = field.uiType || field.type;
            let UiView: any = FormerTypes[uiType];
            
            if (utils.isFunction(defaultComponent)) {
                return defaultComponent(field)
            }

            if (UiView) {
                if (utils.isFunction(field.motion)) {

                    return (
                        <UiView key={field.key} {...props} loading={true} onChangeValue={(v) => {
                            return field.motion({
                                ... props.recordValue,
                                [field.key]: v
                            })
                        }} />
                    )
                } else {
                    if (UiView= UiView.Viewer) {
                        return (
                            <UiView key={field.key} {...props} />
                        )
                    }
                }
            }
        //} else {
            // TODO 枚举翻译
            return (
                <React.Fragment key={'c' + field.key}>
                    {TablerUtils.renderIconComponent(field)}
                    {props.value}
                </React.Fragment>
            )
        //}
        //return null;
    }
}