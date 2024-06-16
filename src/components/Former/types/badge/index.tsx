import React from 'react';
import classnames from 'classnames';

import './style.scss';

export default class FormerBadge extends React.Component<{value:any}, {value: any}> {
    public static Viewer: any = FormerBadge;
    public constructor(props:any) {
        super(props);

        this.state = {
            value: props.value
        }
    }
    public  UNSAFE_componentWillReceiveProps(newProps: any): void {
        if (newProps.value != this.state.value) {
            this.setState({
                value: newProps.value
            })
        }

    }
    public render() {

        return (
            <span className={classnames({
                'ui-former-badge': true,
                'ui-former-badge-open': !this.state.value
            })}></span>
        )
    }
}