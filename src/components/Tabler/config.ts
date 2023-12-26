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
        name: i18n.t('View'),
        align: 10,
        control: {
            type: 'auth',
            key: 'view'
        }
    },
    {
        key: 'edit',
        name: i18n.t('Edit'),
        align: 11,
        control: {
            type: 'auth',
            key: 'edit'
        }

    },
    {
        key: 'remove',
        name: i18n.t('Delete'),
        danger: true,
        align: 12,
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