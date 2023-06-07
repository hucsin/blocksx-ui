import React from 'react';


import { DiagramsTableObject, DiagramsTableField } from '../components/Diagrams/typing';
import DiagramsTable from '../components/Diagrams/table';

let tables: DiagramsTableObject[] = [
    {
      objectKey: 'Hooks',
      objectName: '钩子',
      fields: [
        {
          fieldKey: 'number',
          fieldName: '数值',
          type: 'field',
          fieldType: 'integer',
          fieldLength: 32,
          isIndexed: true
        },
        {
          fieldKey: 'string',
          fieldName: '字符串',
          type: 'field',
          fieldType: 'string',
          isIndexed: true,
          fieldLength: 32
        }
      ]
    },
    {
      objectKey: 'City',
      objectName: '城市',
      fields: [
        {
          fieldKey: 'cityCode',
          fieldName: '城市编码',
          type: 'field',
          fieldType: 'string',
          fieldLength: 32,
          isUniqued: true,
          isAuxed: true
        },
        {
          fieldKey: 'cityName',
          fieldName: '城市名称',
          type: 'field',
          fieldType: 'string',
          fieldLength: 32,
          isIndexed: true

        }
      ]
    },
    {
      color: '#FA5151',
      objectKey: 'Station',
      objectName: '充电站',
      isVersioned: true,
      isHistoryed: true,
      isRecorded: true,
      geography: {
        type: 'field',
        value: 'point'
      },
      fields: [
        {
          fieldKey: 'city',
          fieldName: '城市',
          type: 'relation',
          fieldType: 'one',
          fieldLength: 32,
          fieldConfig: {
            objectKey: 'City'
          }
        },
        {
          fieldKey: 'code',
          fieldName: '充电桩编号',
          type: 'field',
          fieldLength: 32,
          fieldType: 'string',
          
          isUniqued: true,
          isAuxed: true
        },
        {
          fieldKey: 'name',
          fieldName: '充电站名称',
          isIndexed: true,
          type: 'field',
          fieldType: 'string',
          fieldLength: 64,

          isUniqued: true,
          isAuxed: true
        },
        {
          fieldKey: 'stars',
          fieldName: '评分',
          type: 'field',
          isIndexed: true,
          fieldType: 'integer',
          fieldLength: 32
        },
        {
          fieldKey: 'grade',
          fieldName: '等级',
          type: 'field',
          fieldType: 'integer',
          fieldLength: 32
        },
        {
          fieldKey: 'date',
          fieldName: '开始日期',
          type: 'field',
          fieldLength: 32,
          fieldType: 'date'
        },
        {
          fieldKey: 'point',
          fieldName: '坐标',
          type: 'field',
          fieldType: 'point',
          fieldLength: 32
        },
        {
          fieldKey: 'stars_grade',
          fieldName: '评分等级',
          type: 'union',
          fieldType: 'string',
          fieldLength: 32,
          isUniqued: true,
          fieldConfig: {
            type: 'join',
            value: [
              'stars',
              'grade'
            ]
          }
        },
        {
          fieldKey: 'piles',
          fieldName: '充电枪集合',
          type: 'relation',
          fieldType: 'rely_onem',
          fieldLength: 32,
          fieldConfig: {
            objectKey: 'Pile'
          }
        },
        {
          fieldKey: 'json', 
          fieldName: '描述表',
          type: 'field',
          fieldType: 'json',
          fieldLength: 32
        }
      ]
    },
    {
      objectKey: 'Pile',
      objectName: '充电枪',
      fields: [
        {
          fieldKey: 'code',
          fieldName: '枪编号',
          type: 'field',
          fieldType: 'string',
          fieldLength: 32
        },
        {
          fieldKey: 'stacode',
          fieldName: '抢站编码',
          type: 'field',
          isIndexed: true,
          fieldType: 'string',
          fieldLength: 32
        },
        {
          fieldKey: 'sid',
          fieldName: '抢站唯一标识',
          type: 'union',
          fieldType: 'string',
          fieldLength: 32,
          isUniqued: true,
          fieldConfig: {
            type: 'join',
            value: [
              'stacode',
              'code'
            ],
            params: '-'
          }
        }
      ]
    }
  ]

export default class DemoDiagrams extends React.Component {
    public render() {
        return (
            <div>
                <DiagramsTable {...tables[2]} />
            </div>
        )
    }
}