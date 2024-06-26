import React from 'react';
import i18n from '@blocksx/i18n';
import dayjs from 'dayjs';
import classnames from 'classnames';
import { Space, List, Avatar, Segmented, Button, Tooltip, Tag, Radio, DatePicker } from 'antd';
import { Icons, Tabler } from '@blocksx/ui';
import { CaretRightFilled, HistoryOutlined,LoadingOutlined } from '@ant-design/icons';

import { FetchMap } from '../typing';
import './style.scss';


export interface IRuntTest {
    router: any;
    openType: string;
    fetchMap: FetchMap;
    historyType: string;
    historyStartDate: string;
    historyEndDate: string;
    runId: string;
}

export interface SRuntTest {
    openType: string;

    historyType: string;
    historyStartDate: any;
    historyEndDate: any;
    runId: string;
}

export default class RunTest extends React.Component<IRuntTest, SRuntTest> {
    private router: any;
    private dateFormat: string = 'YYYY/MM/DD';
    private colorMap: any = {
        Runing: '#2db7f5',
        Success: '#87d068',
        Error: '#f50'
    }
    private actionTypeMap: any = [
        'run', 'remoting', 'workflow'
    ]
    public constructor(props) {
        super(props);
        this.state = {
            openType: props.openType,
            historyType: props.historyType,
            historyStartDate: props.historyStartDate,
            historyEndDate: props.historyEndDate,
            runId: props.runId
        }
        this.router = props.router;
    }
    public componentWillUpdate(newProps: any) {
        this.router = newProps.router;
        if (newProps.openType != this.state.openType) {
            this.setState({
                openType: newProps.openType
            })
        }
        if (newProps.historyType != this.state.historyType) {
            this.setState({
                historyType: newProps.historyType
            })
        }

        if (newProps.historyStartDate != this.state.historyStartDate) {
            this.setState({
                historyStartDate: newProps.historyStartDate
            })
        }

        if (newProps.historyEndDate != this.state.historyEndDate) {
            this.setState({
                historyEndDate: newProps.historyEndDate
            })
        }
        if (newProps.runId != this.state.runId) {
            this.setState({
                runId: newProps.runId
            })
        }
    }

    public onChange =(value: string)=> {
        let { utils } = this.router;
        utils.goQuery({
            type: value,
            status: '',
            startDate: '',
            endDate: ''
        });
    }
    public openLogPanel =(id: any) => {
        let { utils } = this.router;
        utils.goQuery({
            logs: id
        });
    }
    public onChangeType= (e: any) => {
        let { utils } = this.router;
        utils.goQuery({
            status: e.target.value
        });
    }
    public onChangeRangeDate = (e: any) => {
        
        let { utils } = this.router;
        if (e && e.length == 2) {
            utils.goQuery({
                startDate: e[0].format(this.dateFormat),
                endDate: e[1].format(this.dateFormat)
            });
        } else {
            utils.goQuery({
                startDate:'',
                endDate: ''
            });
        }
    }
    public onExpand=()=> {
        let { utils } = this.router;
        utils.goQuery({
            type: ''          
        })
    }
    private renderHistoryBody () {
        return (
            <Tabler.TablerList
                maxIcon={1}
                minIcon={1}
                iconKey='type'
                size='small'
                actionSize='small'
                iconMaps={{
                    edit: 'FormOutlined',
                    run: 'IRun',
                    remoting: 'IRemoting',
                    workflow: 'IWorkflow',
                    switchOpen: 'ISwitchOpen'
                }}
                descriptionIconMap={[
                    {
                        icon: 'History',
                        key: 'version'
                    },
                    {
                        icon: 'IDataTransfer',
                        key: 'dataTransfer'
                    }
                ]}
                titleKey='started'
                onFetchList = {(pageNumber: number, pageSize:number, params: any) => {
                    return (this.props.fetchMap[this.state.openType] as any)(pageNumber, pageSize, {
                        ...params,
                        type: this.state.openType,
                        status: this.state.historyType,
                        startDate: this.state.historyStartDate,
                        endDate: this.state.historyEndDate
                    })
                }}
                renderItemClassName={(item: any) => {
                    
                    if (item.runId == this.state.runId) {
                        return 'ui-selected stop-animation'
                    } else {
                        return this.actionTypeMap.indexOf(item.type)>-1 ? '' : 'stop-animation';
                    }
                }}
                renderExtra={(item: any) => {
                    if (this.actionTypeMap.indexOf(item.type) > -1) {
                       return <Button size="small">View</Button>
                    }
                    return null;    
                }}
                onItemClick={(rowItem)=> {
                    this.openLogPanel(rowItem.runId)
                }}
                renderDescription={(item: any)=> {
                    if (this.actionTypeMap.indexOf(item.type) > -1) {
                        
                        return (
                            <span>
                                {<Tag icon={item.status == 'Runing' ? <LoadingOutlined/> : null} color={this.colorMap[item.status]}>{item.status}</Tag>}
                                {i18n.t('Duration ' + item.duration)}
                            </span>
                        )
                            
                    } else {
                        if (item.type =='edit') {
                            return i18n.t('Edited by {author}' , {author:item.author})
                        } else {
                            if (item.type == 'switchOpen') {
                                return i18n.t(`${item.status =='Activated' ? 'Activated' : 'Deactivated'} by {author}` , {author: item.author})
                            }
                        }
                    }

                }}
            />
        )
    }
    private renderBody =()=> {
        switch(this.state.openType) {
            case 'history':
                return this.renderHistoryBody()
        }
        return null;
    }
    public render() {
       
        return (
            <div  className={classnames({
                'ui-runtest-toolbar': true,
                'ui-body-hidden': !this.state.openType
            })}>
                <div className='ui-header'>
                    <div className='ui-runtest-bar'>
                    <CaretRightFilled/>  {i18n.t('Run test')}
                    </div>
                    <div className='ui-runtest-action'>
                        <Space size='large'>
                            <Segmented value={this.state.openType} options={[
                                {
                                    label: (<span><HistoryOutlined/> {i18n.t('History')}</span>),
                                    value: 'history'
                                }/*,
                                {
                                    label: (<span><Icons.IStatistics/> {i18n.t('Statistics')}</span>),
                                    value: 'statistics'
                                }*/
                            ]} onChange={this.onChange}></Segmented>
                        </Space>
                    </div>

                    <div className='ui-exte'>
                        <Space>
                            {this.state.openType=='history' && <Tooltip title={i18n.t('Filter dates for the history')}>
                                <DatePicker.RangePicker
                                    defaultValue={[this.state.historyStartDate && dayjs(decodeURIComponent(this.state.historyStartDate), this.dateFormat), this.state.historyEndDate && dayjs(decodeURIComponent(this.state.historyEndDate), this.dateFormat)]}
                                    format={this.dateFormat}
                                    size='small'
                                    onChange={this.onChangeRangeDate}
                                />
                            </Tooltip>}
                            {this.state.openType=='history' &&<Tooltip title={i18n.t('Filter the history status')}>
                                <Radio.Group size="small"  value={this.state.historyType} onChange={this.onChangeType}>
                                    <Radio.Button value="working">{i18n.t('Working')}</Radio.Button>
                                    <Radio.Button value="edit">{i18n.t('Edit')}</Radio.Button>
                                </Radio.Group>
                            </Tooltip>}
                            <Tooltip title={i18n.t('Close the panel')}>
                                <Button onClick={this.onExpand} size="small" icon={<Icons.DownDirectivityOutlined/>}></Button>
                            </Tooltip>
                        </Space>
                    </div>
                </div>

                <div className='ui-body'>
                    {this.renderBody()}
                </div>
            </div>
        )
    }
}