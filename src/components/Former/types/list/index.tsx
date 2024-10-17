import React from 'react';

import './style.scss';

interface FormerListProps {
    value: any;
    onChange: (value: any) => void;
}

interface FormerListState {
    value: any;
}

export default class FormerList extends React.Component<FormerListProps, FormerListState> {
    public constructor(props: FormerListProps) {
        super(props);
        this.state = {
            value: props.value
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: FormerListProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value
            })
        }
    }

    public render() {
        return (
            <div className="former-list">
                
            </div>
        )
    }
}