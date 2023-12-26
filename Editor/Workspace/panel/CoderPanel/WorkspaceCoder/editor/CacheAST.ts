import { utils } from '@blocksx/core';

export default class CacheAST {
    private aliasMap: any;
    public stm: any;
    private editorUtil: any;
    private fromTableCache: any;
    private fromTableCacheToken: any;
    private tokenMap: any;
    private virtualTableCache: any;
    public constructor(stm: any, editorUtil: any) {
        this.aliasMap = {};
        this.editorUtil = editorUtil;
        this.fromTableCache = {};
        this.fromTableCacheToken = {};
        this.virtualTableCache = {};
        this.tokenMap = {};
        this.stm = stm;
        console.log(stm)
        this.initTableCache(stm.tables || []);
        this.initColumnsCache(stm.columns || []);
    }
    /**
     * TODO 修改代码实现
     * 初始化字段缓存
     * @param columns 
     */
    private initColumnsCache(columns: any[]) {
        let stmno: number;

        columns.forEach((col: any) => {
            this.initCacheMap(stmno = col.stmno);
            let aliasMap: any = this.aliasMap[stmno];

            if (col.as) {
                aliasMap.columnMap[utils.toUpper(col.as)] = col.text;
                // 临时在columns里面加入别名字段
                aliasMap.columns.push({
                    ...col,
                    text: col.as,
                    start: col.start + 4,
                    clause: 'AS_' + col.clause
                });
            }

            aliasMap.columns.push(col);

            // 存在相关表的情况
            if (col.table) {
                
                let fromTable: any = this.fromTableCache[col.stmno];
                // 如果不存在from表或该字段的相关表不在from表里面就尝试查找别名表
                if (!fromTable  || !fromTable.find((it: any) => {
                    return this.editorUtil.ignoreCaseContrast(it.text, col.table.text)
                })) {
                    
                    // 去别名里面去获取
                    let astable: any = this.getAliasTable(col.stmno, col.table.text);
                    if (astable) {
                        col.table.asFor = astable;
                    }
                }
            }

            this.tokenMap[col.start] = col;
        })
    }
    /**
     * TODO 修改实现代码
     * 初始化表数据
     * @param tables 
     */
    private initTableCache(tables:any[]) {
        tables.map((tb: any) => {
            this.initCacheMap(tb.stmno);
            // 加入别名表
            if (tb.as) {
                this.aliasMap[tb.stmno].tableMap[utils.toUpper(tb.as)] = tb; 
            } else {
                // 
                if (tb.clause == 'AS_FROM') {
                    this.aliasMap[tb.stmno].tableMap[utils.toUpper(tb.text)] = tb; 
                }
            } 


            if (tb.clause && tb.clause.indexOf('FROM') > -1) {
                this.fromTableCache[tb.stmno].push(tb)
            }

            this.aliasMap[tb.stmno].tables.push(tb)
            this.tokenMap[tb.start] = tb;

            return tb;
        }).filter((tb:any) => {
            
            //  给table加上 asFor
            let asName: string = utils.toUpper(tb.text);
            let tableMap: any = this.aliasMap[tb.stmno].tableMap;

            if (tableMap[asName]) {
                tb.asFor = tableMap[asName]
            }
        });
    }
    private initCacheMap(stmno:number) {
        if (!this.aliasMap[stmno]) {
            this.aliasMap[stmno]= {
                tableMap: {},
                columnMap: {},
                tables: [],
                columns: []
            }
            this.fromTableCache[stmno] = []
        }
    }
    public getTables(stmno?: number) {
        if (stmno) {
            return this.aliasMap[stmno] ? this.aliasMap[stmno].tables : []
        }
        return this.stm.tables;
    }
    public getColumns(stmno?: number) {

        if (stmno) {
            return this.aliasMap[stmno] ? this.aliasMap[stmno].columns || [] : []
        }
        return this.stm.columns || [];
    }
    /**
     * 查找比stmno大或则相等的别名原始表
     * @param stmno 
     * @param as 
     */
    public getAliasTable(stmno: number, as:string) {
        let aliasMap: any = this.filterAliasMap((it) => it <= stmno);
        let aliasName: string = utils.toUpper(as)
        let match: any ;

        aliasMap.find((at: any) => {
            if (at.tableMap[aliasName]) {
                match = at.tableMap[aliasName];
                return true;
            }
        })
        return match;
    }
    /**
     * 获取真实的表列表, 添加临时表
     */
    private filterAliasMap(fn: Function) {
        let aliasMap: any = [];
        for(let prop in this.aliasMap) {
            if (fn(prop)) {
                aliasMap.push(this.aliasMap[prop])
            } 
        }
        return aliasMap;
    }
    
    /**
     * 通过token获取该token的子句上的from表
     * @param token 
     */
    public getFromTableByToken(token: any, filter?: Function) {
        let stmno: number = token.stmno;
        
        if (this.fromTableCacheToken[stmno]) {
            return this.fromTableCacheToken[stmno];

        } else {
            let tables: any = this.getTables(stmno);

            return this.fromTableCacheToken[stmno] = tables.filter((tab: any) => {
                
                if (tab.clause) {

                    let isFromTable: boolean = tab.clause.indexOf('FROM') > -1;

                    return filter ? filter(tab, isFromTable) : isFromTable
                }
            })
        }   
    }
    
    /**
     * 通过token获取该token的子句上的from表,并过滤是否在表列表里面存在
     * @param token 
     */
    public getTrueFromTableByToken(token: any) {
        let tableList: any = this.editorUtil.getTableList(true);
        
        return this.getFromTableByToken(token, (table: any, isFromTable: boolean) => {
            
            if (isFromTable) {
                // 验证表是否在schema对应的表内
                if (!(tableList.indexOf(utils.toUpper(table.text))> -1)) {
                    // 检查别名表
                    let trueTableToken: any = this.getAliasTable(table.stmno, table.text);

                    if (trueTableToken) {
                        return table.asFor = trueTableToken;
                    }
                } else {
                    return true;
                }
            }
            return false
        })
    }
    /**
     * 查看当前字段是否是别名表
     * @param columnToken 
     */
    public findAsColumnByToken(columnToken:any) {
        let stmno:number = columnToken.stmno;
        let columnName: string = utils.toUpper(columnToken.text)

        let aliasMap: any = this.filterAliasMap((it) => it >= stmno);
        // TODO 修改
        return aliasMap.find((am: any) => {
            return !!am.columnMap[columnName]
        })
    }

    /**
     * 获取虚拟表的字段
     * @param vtToken 
     * @returns 
     */
    public getVirtualTableColumns(vtToken: any) {
        let stmno: number = vtToken.stmno;
        let cacheKey: string = [stmno, 'c'].join('.')

        if (this.virtualTableCache[cacheKey]) {
            return this.virtualTableCache[cacheKey]
        } else {
            let virtualTable: any = this.getVirtualTableList(vtToken).find((vt: any) => {
                return this.editorUtil.ignoreCaseContrast(vt.text, vtToken.text)
            })

            if (virtualTable && virtualTable.astmno && this.aliasMap[virtualTable.astmno]) {
                return this.virtualTableCache[cacheKey] = this.aliasMap[virtualTable.astmno].columns.filter((col: any) => {
                    
                    return col.clause == 'SELECT' || col.clause == 'AS_SELECT';
                }).map(it=> utils.toUpper(it.text))
            }
            return []
        }
    }
    public getVirtualTableList(token: any, onlyName?: boolean) {
        let stmno: number = token.stmno;
        let virtualTable: any = [];

        if (this.virtualTableCache[stmno]) {
            virtualTable = this.virtualTableCache[stmno]
        } else {
            virtualTable = this.virtualTableCache[stmno] = this.stm.tables.filter((tabToken: any) => {
                
                if (tabToken.stmno<=stmno) {
                    return tabToken.clause == 'AS_FROM'
                }
            });
        }

        return onlyName ? virtualTable.map(it=> utils.toUpper(it.text)) : virtualTable
    }   
    public isVirtualTable(tableToken:any) {
        
        if (tableToken.clause == 'AS_FROM') {
            return true;
        }
        let virtualTable: any = this.getVirtualTableList(tableToken, true);
        
        return virtualTable.indexOf(utils.toUpper(tableToken.text)) > -1;
    }
}