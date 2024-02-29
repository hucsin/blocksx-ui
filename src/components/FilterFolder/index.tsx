import React from 'react';
import classnames from 'classnames';
import { Input, Button, Popover, Spin, Popconfirm, Empty, Skeleton, Space } from 'antd';
import { PlusOutlined, FolderOutlined, FolderOpenOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';

import { utils } from '@blocksx/core';
import { routerParams } from '../utils/withRouter';

import i18n from '@blocksx/i18n';
import * as Icons from '../Icons';
import SplitPane from '../SplitPane';


import './style.scss';


interface FolderMeta {
    value?: string;
    label: string | Function;
    description?: string;
    total?: number;
    type?: string;
}

export interface FilterFolderProps {
    
    title: string;
    icon: string;
    
    currentKey?: string;

    sysFolders?: FolderMeta[] | any;
    folders?: FolderMeta[];

    onAddCustomFolder?(folderMeta: FolderMeta): Promise<any>;
    onRemoveCustomFolder?({id}): Promise<any>;
    onFetchCustomFolders?(params: any): Promise<any>;
    onChange?: Function;
    onSelectValue?: Function;
    children?: any;

    router?: routerParams;
}

interface FilterFolderState {
    currentKey?: string;
    searchValue?: string;
    orignFolders: FolderMeta[];
    folders: FolderMeta[];

    formInput?: string;
    formLabel?: string;
    formText?: string;

    addLoading:boolean;
    loading: boolean;
    open?: boolean;
    error?: string;

    title: string;
    icon: string;

}

export default class FilterFolder extends React.Component<FilterFolderProps, FilterFolderState> {
    
    static defaultProps = {
        sysFolders: [
            { 
                value: 'all',
                label: (props: any) => {
                    return 'all records';
                    //return props.title ? i18n.join('all', props.title) : i18n.t('all')
                },
                description: 'View all data records'
            },
            {
                value: 'none',
                label: i18n.t('uncategorized'),
                description: 'No grouped records'
            }
        ]
    }
    
    public constructor(props: FilterFolderProps) {
        super(props);

        this.state = {
            currentKey: props.currentKey || 'all',
            folders: props.folders || [],
            orignFolders: props.folders || [],
            error: '',
            addLoading: false,
            loading: false,
            searchValue: '',
            icon: props.icon,
            title: props.title
        }
        
    }

    public componentDidMount() {

        this.fetch();
    }
    public UNSAFE_componentWillUpdate(newProps: any) {
        
        if (newProps.title != this.state.title) {
            this.setState({
                title: newProps.title,
                icon: newProps.icon
            }, this.fetch)
        }
    }

    private fetch =()=> {
        if (this.props.onFetchCustomFolders) {
            this.setState({loading: true})
            this.props.onFetchCustomFolders({
                pageNumber: 1,
                pageSize: 50
            }).then((result: any)=>{
                
                let fetchData: any = (utils.isArray(result.data) ? result.data:result).map(it => { return {...it, key: it.id}})

                this.setState({
                    loading: false,
                    orignFolders: fetchData,
                    folders: fetchData
                }, ()=> {
                    this.doSelectFolder();
                })


            }, ()=> {
                this.setState({loading: false})
            })
        }
    }
    private getCurrentValue(current?: string) {
        let orignFolders: any = [...this.state.orignFolders, ...this.props.sysFolders];
        let currentKey:any =  current || this.state.currentKey;

        let find: any = orignFolders.find(it => it.value === currentKey);

        if (utils.isFunction(find.label)) {
            find.label = find.label(this.props)
        }
        return find;
    }
    private doSelectFolder() {
        
        let currentFolder: any = this.getCurrentValue();
        
        if (this.props.onChange) {
            this.props.onChange(this.state.currentKey, currentFolder)
        }
    }
    private getLabelName(it: FolderMeta) {
        if (typeof it.label == 'function') {
            return it.label(this.props)
        }
        return it.label;
    }

    private renderFolders() {
        let { folders } = this.state;

        return (
            <div>
                {folders && folders.length ? <dl className='ui-folder-more' key={2}>
                    {folders.map(it => {
                        return this.renderItem(it, true)
                    })}
                </dl>
                :<Empty description={false} />}
            </div>
        )
    }
    private renderTitle() {
        let IconView: any = Icons[this.state.icon];
        
        if (IconView) {
            return (
                <React.Fragment>
                    <IconView/>
                    {this.state.title}
                </React.Fragment>
            )
        } else {
            return this.state.title
        }
    }
    
    private onSelect(key: string) {
        this.setState({
            currentKey: key
        }, ()=> {

            this.props.onChange && this.props.onChange(key, this.getCurrentValue(key))
        })
        
    }
    private onRemoveItem(key:string) {
        this.setState({ loading: true});

        if (this.props.onRemoveCustomFolder) {
            this.props.onRemoveCustomFolder({id: key}).then(()=> {
                let folders: any = this.state.folders;

                folders = folders.filter(it => {
                    return it.key !== key;
                })

                //if (key == currentKey) {
                   // currentKey = this.getDefaultCurrentKey(this.props.sysFolders, folders);
                    
                  //  this.onSelect(currentKey);
                //}

                this.setState({loading:false, folders})
            }, ()=> {
                this.setState({loading:false})
            })
        }
    }
    private renderItem(folder: FolderMeta, hasTotal:boolean) {

        let itemTotal: any = folder.total ? (Math.max(folder.total || 0, 0)) : 0;

        return (
            <dd 
                key={folder.value} 
                className={classnames({
                    'ui-select': folder.value == this.state.currentKey
                })}
                onClick={(e)=> {
                    let target: any = e.target;
                    let className: string = target.className || '';
                    
                    if (className.indexOf('ui-title') > -1 || className.indexOf('anticon-folder') > -1 || target.nodeName =='DD') {
                        this.onSelect(folder.value as string)
                    }
                }}
            >
                {folder.value == this.state.currentKey ? <FolderOpenOutlined/> : <FolderOutlined/>}
                <span className='ui-title'>{this.getLabelName(folder)}</span>

                {hasTotal && this.props.onRemoveCustomFolder 
                    && <Popconfirm 
                            title={i18n.t('are you sure to delete this folder?')}
                            //description={i18n.t('delete this folder')}
                            placement="right"  
                            okText={i18n.t('ok')}
                            cancelText={i18n.t('no')}
                            onConfirm={()=> {
                                this.onRemoveItem(folder.value as string)
                            }}
                        >
                            <CloseOutlined />
                    </Popconfirm>
                 }
                {hasTotal && <span className='ui-total'>{typeof itemTotal == 'undefined' ? folder.total || 0 : itemTotal}</span>}
            </dd>
        )
    }
    private renderPopoverContent  = () => {
        return (
            <div className={classnames({
                "ui-folder-fomer": true,
                "ui-error": !!this.state.error
            })}>
                <Spin spinning={this.state.addLoading}>
                    <div className='ui-label folder'>{i18n.t('folder name / label')} * </div>
                    <div className='ui-content folder'>
                        <Space.Compact>
                            <Input  
                                width={'50%'}
                                size='small' 
                                placeholder='folder name'
                                maxLength={128}
                                onChange={(v) => {
                                    this.setState({
                                        error: '',
                                        formInput: v.target.value,
                                        formLabel: v.target.value
                                    })
                                }}
                            />
                            <Input  
                                width={'50%'}
                                size='small' 
                                placeholder='folder label'
                                value={this.state.formLabel}
                                maxLength={128}
                                onChange={(v) => {
                                    this.setState({
                                        error: '',
                                        formLabel: v.target.value
                                    })
                                }}
                            />
                        </Space.Compact>

                    </div>
                    <div className='ui-label'>{i18n.t('description')}</div>
                    <div>
                        <Input.TextArea 
                            size='small'
                            maxLength={250}
                            onChange={(v)=> {
                                this.setState({
                                    error: '',
                                    formText: v.target.value
                                })
                            }}
                        />
                    </div>
                    <div className='ui-right'>
                        <Button 
                            type='primary'
                            size='small'
                            disabled={!this.state.formInput || !this.state.formLabel }
                            onClick={this.onSaveAddFolder} 
                        > {i18n.t('save')} </Button>
                    </div>
                </Spin>
            </div>
        );
    }
    private onOpenChange =(open: boolean)=> {
        this.setState({
            formInput: '',
            formText: '',
            error: '',
            open: open
        })
    }
    private onSearch =(e:any) => {
        let v: string = e.target.value;
        let reg: any = new RegExp(v.replace(/[\/\\]/ig, ''),'i');
        let newFolder: any = this.state.orignFolders.filter(it => {
            let name: string = this.getLabelName(it);
            let description: string = it.description || '';
            return !!name.match(reg) || description.match(reg)
        })
        this.setState({
            searchValue: v,
            folders: newFolder
        })
    }
    private onSaveAddFolder = () => {
        let { formInput ,formLabel, formText } = this.state;
        let value: any = {
            name: formInput,
            value: formInput,
            label: formLabel,
            description: formText
        }
        
        if (!formInput) {
            return this.setState({
                error: i18n.t('folder name  must be filled in') + '!'
            })
        }

        this.setState({ addLoading: true })

        if (this.props.onAddCustomFolder) {
            this.props.onAddCustomFolder(value).then((data: any)=> {
                let folders: any = this.state.folders;
                    folders.unshift({
                        ...value,
                        key: data.id,
                        ...data
                    });

                this.setState({ addLoading: false, folders, open: false });
                
            }, ()=> {
                this.setState({ addLoading: false });
            })
        }

    }
    public render() {

        return (
            <div className='ui-folder-wraper'>
                <SplitPane minSize={200} size={240}  maxSize={400}>
                    <SplitPane.Pane  >
                        <div className='ui-filter-folder'>
                        <div className='ui-filter-folder-title'>{this.renderTitle()}</div>
                            <Input
                                suffix={<SearchOutlined/>}
                                onChange={this.onSearch}
                            />
                        { this.state.loading ? <Skeleton active/> :<>
                            
                            <dl 
                                key={1}
                                className={classnames({
                                    'ui-has-child': this.state.folders && this.state.folders.length
                                })}
                            >
                                <dt>
                                    <span className='title'>{i18n.t('folders')} </span>
                                    {this.props.onAddCustomFolder && <Popover
                                        title={i18n.t('add new folder')}
                                        placement='bottomLeft'
                                        trigger={['click']}
                                        content={this.renderPopoverContent}
                                        rootClassName="ui-folder-popover"
                                        onOpenChange={this.onOpenChange}
                                        open ={this.state.open}
                                    >
                                        <Button icon={<PlusOutlined/>} size="small"></Button>
                                    </Popover>}
                                </dt>
                                {this.props.sysFolders && this.props.sysFolders.map(it => {
                                    return this.renderItem(it, false)
                                })}
                            </dl>
                            {this.renderFolders()}
                            </>}
                        </div>
                    </SplitPane.Pane>
                    <SplitPane.Pane>
                        <div className='ui-folder-body'>{this.props.children}</div>
                    </SplitPane.Pane>
                </SplitPane>
            </div>
        )
    }
}