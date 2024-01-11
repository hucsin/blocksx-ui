/*
 * @Descripttion: 
 * @Version: 1.0.0
 * @Author: uoeye
 * @Date: 2020-12-15 11:31:59
 */
import i18n from '@blocksx/i18n';

import { RowOperate } from './typings';


/**
 * 默认的行操作按钮
 */
export const DEFAULT_COLUMNS_ACTION: RowOperate[] = [
    {
        key: 'view',
        type: 'view',
        name: i18n.t('View'),
        align: 1,
        control: {
            type: 'auth',
            key: 'view'
        }
    },
    {
        key: 'edit',
        type: 'edit',
        name: i18n.t('Edit'),
        align: 2,
        control: {
            type: 'auth',
            key: 'edit'
        }

    },
    {
        key: 'remove',
        type: 'remove',
        name: i18n.t('Delete'),
        danger: true,
        confirm: 'Do you want to delete the record?',
        align: 3,
        control: {
            type: 'auth',
            key: 'remove'
        }
    }
];

/**
 * 默认的批量操作
 */
export const DEFAULT_BATCH_ACTION: RowOperate[] = [
    {
        key: 'remove',
        type: 'remove',
        batch: true,
        danger: true,
        name: '删除已选({selected}条)',
        control: [{
            type: 'state',
            key: 'selected'
        },{
            type: 'auth',
            key: 'remove'
        }]
    }/*,
    {
        key: 'removeSearch',
        batch: true,
        searcher: true,
        danger: true,
        name: '删除条件过滤({total}条)',
        control: {
            type: 'auth',
            key: 'remove'
        }
    }*/
]