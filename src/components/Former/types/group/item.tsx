import React from 'react';
import classnames from 'classnames';
import { Tooltip } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export default class FormerGroupItem extends React.Component<{
    title: string,
    children?: any, hidden?: boolean, groupType: any, groupMeta: any
}, { collapse: boolean }> {
    public constructor(props: any) {
        super(props);
        this.state = {
            collapse: this.getDefaultCollapse(props)
        }
    }
    private getDefaultCollapse(props: any) {
        
        let { groupMeta = {}}  = props;

        if (props.groupType == 'more') {

            if (groupMeta && Array.isArray(groupMeta.fold)) {
                return groupMeta.fold.indexOf(props.title) > -1;
            }
            if (props.index > 0) {
                return true;
            }
        }
        return false;
    }
    private onCollapse = () => {
        this.setState({
            collapse: !this.state.collapse
        })
    }
    private showGroupTips(title: string) {
        let { groupMeta = {} } = this.props;
        if (groupMeta[title] && groupMeta[title].tooltip) {
            return (
                <Tooltip title={groupMeta[title].tooltip}>
                    <QuestionCircleOutlined />
                </Tooltip>
            )
        }
    }
    public render() {
        let showMore: boolean = this.state.collapse && this.props.groupType == 'more';
        let showTitle: boolean = showMore || !!this.props.title && (this.props.title.length > 2);
        
        return (
            <div className={
                classnames({
                    "former-group-item": true,
                    [`former-group-type-${this.props.title}`]: this.props.title,
                    "former-group-typeMore": showMore,
                    'former-group-hidden': this.props.hidden,
                })
            }>

                {showTitle ? <div className="former-group-item-title" onClick={this.onCollapse}>

                    {showMore ? 'Advanced Setting' : this.props.title}
                    {showMore ? <DownOutlined /> : ''}
                    {!showMore && this.showGroupTips(this.props.title)}
                    <div className="former-group-collapse">{this.state.collapse ? <RightOutlined /> : <DownOutlined />}</div>

                </div> : null}

                <div className={classnames('former-group-item-content', {
                    'former-group-item-hidden': this.state.collapse,
                    'former-group-item-border': this.props.title,
                    [`former-group-length-${this.props.children.length}`]: true
                })}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

