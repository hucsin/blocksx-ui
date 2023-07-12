import React from 'react';
import classnames from 'classnames';
import { Select, Tooltip } from 'antd';
import { ProductTrigger, EllipsisOutlined } from '../Icons/index'
import i18n from '@blocksx/i18n';

interface FilterProps {
    tagsList: any[],
    selectedTags: any[],
    onChange: Function
}
interface FilterState {
    tagsList: any[],
    selectedTags: any[],
    open: boolean;
}

export default class Filter extends React.Component<FilterProps, FilterState> {
    public constructor(props: FilterProps) {
        super(props);

        this.state = {
            tagsList: props.tagsList,
            selectedTags: props.selectedTags || [],
            open: false
        }
    }

    public UNSAFE_componentWillReceiveProps(newProps:FilterProps) {

        let { tagsList, selectedTags } = this.state;

        if (newProps && (tagsList.length != newProps.tagsList.length)) {
            this.setState({
                tagsList: newProps.tagsList
            })
        }
        
        if (newProps.selectedTags && (selectedTags.length != newProps.selectedTags.length)) {
            this.setState({
                selectedTags: newProps.selectedTags
            })
        }
    }


    public render() {
        return (
            <div className={classnames({
                'hoofs-diagrams-filter': true,
                'hoofs-diagrams-open': this.state.selectedTags.length > 0 || this.state.open
            })}>
                <Tooltip title={i18n.translate('过滤画布对象')}>
                    <ProductTrigger />
                </Tooltip>
                <Select 
                    mode="multiple"
                    bordered={false}
                    allowClear={true}
                    popupClassName="hoofs-diagrams-filter-more"
                    size="small"
                    options={this.state.tagsList}
                    maxTagCount={3}
                    onDropdownVisibleChange={(open: boolean) => {
                        this.setState({open})
                        if (!open) {
                            this.props.onChange
                              && this.props.onChange(this.state.selectedTags);
                        }
                    }}
                    onChange={(v:any) => {
                        this.setState({
                            selectedTags:v
                        })
                        
                    }}
                />
            </div>
        )
    }
}