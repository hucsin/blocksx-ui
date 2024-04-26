import React from 'react';
import classnames from 'classnames';

import FormerGroupItem from './item';
import "./style.scss";

export default class FormerObject extends React.Component<{
    children?:any;}, {}> {

    static Item = FormerGroupItem;

    public constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <div className={
                classnames("former-group", {

                })
            }>
                {this.props.children}
            </div>
        )
    }
}