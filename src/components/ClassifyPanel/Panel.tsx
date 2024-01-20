import React from 'react';

interface IPanel {
    children: any;
    value: string;
    label: string;
    total?: number;
}

export default class Panel extends React.Component<IPanel>{
    public constructor(props: IPanel) {
        super(props)
    }
    public render() {
        return (
            <React.Fragment>
                {this.props.children}
            </React.Fragment>
        )
    }
}