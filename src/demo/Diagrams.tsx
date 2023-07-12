import React from 'react';


import { DiagramsTableObject, DiagramsTableField } from '../components/Diagrams/typing';
import DiagramsTable from '../components/Diagrams/table';
import Diagrams from '../components/Diagrams';
import Former from '../components/Former';
import Pick from '../components/Pick';

import { message } from 'antd';

let tables: DiagramsTableObject[] = [
    {
      color: '#4338CA',
      objectKey: 'Hooks',
      left: 500,
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
      color: '#7B1FA2',
      objectKey: 'City',
      objectName: '城市',
      left: 50,
      top: 300,
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
      left: 300,
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
            objectKey: 'City',
            fieldKey: 'cityCode'
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
      color: '#3F51B5',
      left: 500,
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
        }
      ]
    }
  ]


export default class DemoDiagrams extends React.Component<{}, {visible: boolean,tableList:any}> {
    public constructor(props: any) {
      super(props);

      let table: any = localStorage.getItem('__diagrams');

      if (table) {
        table = JSON.parse(table);
      }

      this.state ={
        visible: false,
        tableList: table || tables
      }

      setTimeout(() => {
        this.setState({
          visible: true
        })
      }, 4000);
    }
    public render() {
        return (
            <div style={{height: '100%'}}>
                <div style={{float: 'left',opacity: .3}}>
                 
                </div>
                <div style={{height: '100%'}}>
                  <Diagrams 
                    tableList={this.state.tableList}
                    onChange = {(v) => {
                      localStorage.setItem('__diagrams', JSON.stringify(v))
                    }}
                  ></Diagrams>
                </div>
            </div>
        )
    }
}