import React from 'react';
import classnames from 'classnames';
import { Input, Button,message, Popover, Spin, Popconfirm, Empty, Skeleton, Space } from 'antd';
import { PlusOutlined, FolderOutlined, FolderOpenOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';

import { utils } from '@blocksx/core';
import { routerParams } from '../utils/withRouter';

import i18n from '@blocksx/i18n';
import * as Icons from '../Icons';
import SplitPane from '../SplitPane';

import TablerUtils from '../utils/tool'


import './style.scss';


interface FolderMeta {
    value?: string;
    icon?: string;
    label: string | Function;
    description?: string;
    total?: number;
    type?: string;
}

export interface FilterFolderProps {
    
    title: string;
    icon: string;
    leftSize: number;
    params?: any;
    mode?: 'filter' | 'folder';
    
    currentKey?: string;

    sysFolders?: FolderMeta[] | any;
    defaultDescription?: string;
    folders?: FolderMeta[];

    onAddCustomFolder?(folderMeta: FolderMeta): Promise<any>;
    onRemoveCustomFolder?({id}): Promise<any>;
    onFetchCustomFolders?(params: any): Promise<any>;
    onChange?: Function;
    onSelectValue?: Function;
    children?: any;

    router?: routerParams;

    reflush?: any;
}

interface FilterFolderState {
    currentKey?: string;
    currentIcon?: string;
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

    reflush: any;
    expand: boolean;
}

export default class FilterFolder extends React.Component<FilterFolderProps, FilterFolderState> {
    
    static defaultProps = {
        leftSize: 240,
        mode: 'folder',
        sysFolders: [
            { 
                value: 'all',
                label: (props: any) => {
                    return 'all records';
                    //return props.title ? i18n.join('all', props.title) : i18n.t('all')
                },
               // description: 'View all data records'
            },
            {
                value: 'none',
                label: i18n.t('uncategorized'),
                description: 'Display the {title} records without grouping.'
            }
        ],
        defaultDescription: 'Display the data records for category {value}.'
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
            title: props.title,

            reflush: props.reflush,
            expand: (props.mode !== 'filter'|| props.currentKey && props.currentKey!=='all') ? false : true,
            currentIcon: '',
        }

    }

    public componentDidMount() {
        if (!this.state.expand) {
            this.fetch(true);
        }
    }
    public UNSAFE_componentWillReceiveProps(newProps: any) {
        
        if (newProps.title != this.state.title) {
            this.setState({
                title: newProps.title,
                icon: newProps.icon
            }, this.fetch)
        }
        
        if (newProps.reflush != this.state.reflush) {
            this.setState({
                currentKey: '',
                reflush: newProps.reflush
            }, () => {
                if (!this.state.expand) {
                    this.fetch();
                }
            })
        }
    }

    private fetch =(init?: boolean)=> {
        if (this.props.onFetchCustomFolders) {
            this.setState({loading: true})
            this.props.onFetchCustomFolders({
                pageNumber: 1,
                pageSize: 50
            }).then((result: any)=>{
                let fetchData: any = (utils.isArray(result.data) ? result.data:result).map(it => { return {...it, key: it.id}})
                let findItem: any = fetchData.find(it=> it.value === this.state.currentKey);

                this.setState({
                    loading: false,
                    orignFolders: fetchData,
                    folders: fetchData,
                    currentIcon: findItem ? findItem.icon : ''
                }, ()=> {
                    this.doSelectFolder(init);
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

        if (find && utils.isFunction(find.label)) {
            find.label = find.label(this.props)
        }
        return find;
    }
    private doSelectFolder(init?: boolean) {
        
        let currentFolder: any = this.getCurrentValue();
    
        currentFolder && this.onChange(this.state.currentKey, currentFolder, init)
    }
    private onChange(currentKey: any, folder: any, init?: boolean) {
        
        let params: any = this.props.params || {};
        if (this.props.onChange) {
            if (currentKey !== 'all') {
                if (!folder.description) {
                    folder.description = this.props.defaultDescription;
                    params = folder;
                }

                if (folder.description.indexOf('{') > -1) {
                    folder.description = utils.template(folder.description, params)
                }
                
            }

            this.props.onChange(currentKey, folder, init)
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
                :null}
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


    
    private onSelect(key: string, folder: any) {
        
        this.setState({
            currentKey: key,
            currentIcon: folder.icon
        }, ()=> {
            this.onChange(key, this.getCurrentValue(key))
        })
        
    }
    private onRemoveItem(key:string) {
        this.setState({ loading: true});

        if (this.props.onRemoveCustomFolder) {
            this.props.onRemoveCustomFolder({id: key}).then(()=> {
                let folders: any = this.state.folders;

                folders = folders.filter(it => {
                    return it.value !== key;
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
    private renderItemIcon(folder: FolderMeta) {
        if (folder.icon) {
            return TablerUtils.renderIconComponent(folder)
        }

        return folder.value == this.state.currentKey ? <FolderOpenOutlined/> : <FolderOutlined/>
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
                        this.onSelect(folder.value as string, folder)
                    }
                }}
            >
                {this.renderItemIcon(folder)}
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
                {hasTotal && folder.total && <span className='ui-total'>{typeof itemTotal == 'undefined' ? folder.total || 0 : itemTotal}</span>}
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
                                disabled
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
                    <div className='ui-label'>{i18n.t('description')} *</div>
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
                            disabled={!this.state.formInput || !this.state.formLabel || !this.state.formText }
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
        
        if (!formInput && !formText) {
            return this.setState({
                error: i18n.t('Must be filled in all fields') + '!'
            })
        }
        let folders: any = this.state.folders || [];
        
        if (folders.length >= 10) {
            message.error('A maximum of 10 folders is allowed.')
            return this.setState({
                error: 'A maximum of 10 folders is allowed.'
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
    private displaySystemFolder() {
        return this.props.mode !== 'filter'
    }
    private onExpand=()=> {
        
        this.setState({
            expand: !this.state.expand
        }, ()=> {
            let { expand, orignFolders } = this.state;

            if (!expand && (!orignFolders|| orignFolders.length ==0)) {
                this.fetch(true)
            } 
        })
    }
    public render() {
        let { expand }  = this.state;
        return (
            <div className={
                classnames({
                    'ui-folder-wraper': true,
                    'ui-folder-mode-filter': !this.displaySystemFolder()
                })
            }>
                <SplitPane minSize={expand? 0: 140} size={expand ? 0 : this.props.leftSize || 240}  maxSize={expand? 0 :400}>
                    <SplitPane.Pane  >
                        <div className='ui-filter-folder'>
                          
                            <div className='ui-filter-folder-title'>{this.renderTitle()}</div>
                            <Input
                                suffix={<SearchOutlined/>}
                                onChange={this.onSearch}
                                size="small"
                            />
                        { this.state.loading ? <Skeleton active/> :<>
                            
                            {this.props.mode !=='filter' && <dl 
                                key={1}
                                className={classnames({
                                    'ui-has-child': this.state.folders && this.state.folders.length
                                })}
                            >
                                <dt>
                                    <span className='title'>{i18n.t(this.props.mode + 's')} </span>
                                    {this.props.onAddCustomFolder && <Popover
                                        title={i18n.t('add folder')}
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
                                {this.displaySystemFolder() && this.props.sysFolders.map(it => {
                                    return this.renderItem(it, false)
                                })}
                            </dl>}
                            {this.renderFolders()}
                            </>}

                        </div>
                    </SplitPane.Pane>
                    <SplitPane.Pane>
                        {!this.displaySystemFolder() && <div onClick={this.onExpand} className='ui-filter-expand'> {TablerUtils.renderIconComponent({icon: this.state.currentIcon || 'SearchOutlined'})}{expand ?<Icons.ArrowRightOutlined/> :<Icons.ArrowLeftOutlined/>}</div>}
                        <div className='ui-folder-body'>{this.props.children}</div>
                    </SplitPane.Pane>
                </SplitPane>
            </div>
        )
    }
}