import React from 'react';
import { Input,Space, Button } from 'antd';
/*
//import { SQLParser, SelectStatementReader } from '../sqlparser/src/index'
export default class SqlParser extends React.Component<{},{value: string, number: string}> {
    public constructor(props: any) {
        super(props);
        this.state = {
            value: localStorage.getItem('key') || '',
            number: localStorage.getItem('key') || ''
        }
    }
    private onChnage(value: string) {
        this.setState({
            value: value,
            number: value
        })
        localStorage.setItem('key', value)
    }
    private onParser() {
        let parser: any = SQLParser.parser(this.state.value, 'mysql', this.state.number.length);
        console.log('parser',parser );

        console.log('reader', SelectStatementReader.readStatement(parser).position)
    }
    public render() {
        return (
            <Space>
                <Input.TextArea style={{width: 400}} rows={10} value={this.state.value} onChange={({target}) => {
                    this.onChnage(target.value)
                }} />
                <Input.TextArea value={this.state.number} style={{width: 400}}  rows={10}onChange={({target})=> this.setState({number: target.value})}/>
                <Button onClick={()=>{
                    this.onParser();
                }}>Parser</Button>
            </Space>

        )
    }
}*/