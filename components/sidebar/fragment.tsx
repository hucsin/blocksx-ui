import React from 'react';

export  class SideFooter extends React.Component {
    public constructor(props) {
        super(props);
    }
    public render () {
        return (
            <div>footer</div>
        )
    }
}



interface SideHeaderProps {

}

export  class SideHeader extends React.Component<SideHeaderProps> {
    public constructor(props: SideHeaderProps) {
        super(props);
    }
    public render () {
        return (
            <div>header</div>
        )
    }
}


export default {
    SideHeader,
    SideFooter
}