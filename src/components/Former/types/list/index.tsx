import React from 'react';
import { IFormerBase } from '../../typings';
import './style.scss';

interface FormerListProps extends IFormerBase {
    value: any;
    onChangeValue: (value: any) => void;
}

interface FormerListState {
    value: any;
}

export default class FormerList extends React.Component<FormerListProps, FormerListState> {
    public constructor(props: FormerListProps) {
        super(props);
        this.state = {
            value: props.value || []
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: FormerListProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value
            })
        }
    }

    public getProps() {
        return this.props['props'] || this.props['x-type-props'] || {};
    }

    
    public render() {
        return (
            <div className="former-list">
                
                <div className="former-list-item"></div>
                <div className="former-list-add">
                    add
                </div>
            </div>
        )
    }
}