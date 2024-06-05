import i18n from '@blocksx/i18n';

export  const getDefaultMenu = () => {
    return [
        {
            key: 'record.create',
            type: 'create',
            icon: 'FileAddOutlined',
            label: i18n.t('Create Children'),
            align: 97

        },
        {
            key: 'tx',
            type: 'divider'
        },
        {
            key: 'record.edit',
            type: 'edit',
            icon: 'FormOutlined',
            label: i18n.t('Edit'),
            align: 99,
            control: (item) => {
                return item.type && !item.group
            }
    
        },
        {
            key: 'record.delete',
            type: 'delete',
            icon: 'DeleteOutlined',
            label: i18n.t('Delete'),
            danger: true,
            confirm: 'Do you want to delete the node?',
            align: 100,
            control: (item) => {
                return item.type && !item.group
            }
        }
    ]
}