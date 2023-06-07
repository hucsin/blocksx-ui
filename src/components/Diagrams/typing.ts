
export interface DiagramsTableField {
    
    type: 'field' | 'virtual' | 'union' | 'relation';

    fieldKey: string;
    fieldName?: string; // 中文注释
    
    fieldType: 'date' | 'enum' | 'string' | 'integer' | 'decimal' | 
        'boolean' | 'point' | 'json' | 'text' | 'clobs' | 'expression' | 
        'stream' | 'rely_one' | 'rely_onem' | 'one' | 'onem' ;
    fieldValue?: any;
    fieldConfig?: any;
    
    fieldLength: number;
    fieldDecimal?: number;

    defaultValue?: any;

    isRequired?: boolean;
    isIndexed?: boolean;
    isUniqued?: boolean;

    isAuxed?: boolean;
}

export interface DiagramsTableObject {
    
    color?: string;

    objectKey: string;
    objectName?: string;

    isVersioned?: boolean;
    isHistoryed?: boolean;

    isRecorded?: boolean;
    geography?: any; // 地理位置字段
    subject?: string; // 主题字段

    dataSecurity?: 'p' | 'o' | 'of' | 'or' |  'ofr';//  数据安全等级
    dataPermission?: 'p' | 'r' | 'rw';  // 数据权限范围
    dataRange?: 'p' | 'r' | 'o' | 'ro' | 'pr' | 'pro' | 'po' | 's';

    dataRules?: any;

    fields: DiagramsTableField[]
}