import React from 'react';
import classnames from 'classnames';
import { Tooltip } from 'antd';
import { DownOutlined, RightOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export default class FormerGroupItem extends React.Component<{title:string,
  children?:any,hidden?:boolean,groupType: any, groupMeta: any},{collapse:boolean}> {
    public constructor(props:any) {
        super(props);
        this.state = {
            collapse: this.getDefaultCollapse(props)
        }
    }
    private getDefaultCollapse(props:any) {
      if (props.groupType == 'more') {
        if (props.index >0) {
          return true;
        }
      }
      return false;
    }
    private onCollapse =()=> {
        this.setState({
            collapse: !this.state.collapse
        })
    }
    private showGroupTips(title: string) {
      let {groupMeta = {}} = this.props;
      if (groupMeta[title] && groupMeta[title].tooltip) {
        return (
          <Tooltip title={groupMeta[title].tooltip}>
            <QuestionCircleOutlined/>
          </Tooltip>
        )
      }
    }
    public render() {
      let showMore: boolean = this.state.collapse && this.props.groupType == 'more';
        
        return (
            <div className={
              classnames({
                "former-group-item": true,
                "former-group-typeMore": showMore,
                'former-group-hidden': this.props.hidden
              })
            }>
                
                {this.props.title ? <div className="former-group-item-title" onClick={this.onCollapse}>

                    {showMore ? 'More Setting' : this.props.title }
                    {showMore ? <DownOutlined/> : ''}
                    {!showMore && this.showGroupTips(this.props.title)}
                    <div className="former-group-collapse">{this.state.collapse ? <RightOutlined/> : <DownOutlined/> }</div>

                </div> : null}

                <div className={classnames('former-group-item-content', {
                    'former-group-item-hidden': this.state.collapse,
                    'former-group-item-border': this.props.title
                })}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

