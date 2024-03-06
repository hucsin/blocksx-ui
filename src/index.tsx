import React from 'react';
import { createRoot } from "react-dom/client";

import { Button } from 'antd';
import Icon from './components/Former/types/icon';
import LayoutLoginDemo from './demo/Login';
import RouterLayout from './components/RouterLayout';

import SmartPage from './components/SmartPage';
import './style.css';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

// /general/product
// /setting/other

class Text404 extends React.Component<{text: string}, {value:string}> {
  public constructor(props:any) {
    super(props);
    this.state = {
      value: ''

    }
  }
  public render() {
    return (
      <div style={{padding: '40px'}}>
        <Icon value={this.state.value} onChangeValue={(v)=>{ this.setState({value: v})}} />
      </div>
    )
  }
}


class PageOther extends React.Component<{},{open: boolean}> {

  public constructor(props: any) {
    super(props)

    this.state = {open: false}
  }

  public render() {
    return (
      <div style={{margin: 200}}>
        <Button onClick={() => this.setState({open: true})}>go</Button>
        <SmartPage simplicity uiType='former' type="drawer" name="workflow" open={this.state.open}></SmartPage>

        <SmartPage simplicity uiType='former' title="Node Setting" name="testing" type='popover'  >
          <Button> test</Button>
        </SmartPage>

      </div>
    )
  }
}



class TextOther extends React.Component<{text: string}> {
  public render() {
    return (
      <p>WorkflowDetail</p>
    )
  }
}

class DemoLayout extends React.Component {
  public render() {

    return (
      <RouterLayout
        defaultMenus={[{
            value: 'resources',
            label: 'resources',
            type: 'Page',
            level: 0,
            pageMenu: true,
            autoFold: true,
            pageType: 'SmartPage',
            componentName: 'eosresources',
            pagePath: '/resources'
          }
        ]}
        pageComponentMap={{
          PageOther: PageOther,
          PageNotFound: PageOther,
          Login: LayoutLoginDemo,
          WorkflowDetail: PageOther
        }}
      />
    )

  }
}


/*
root.render(0 && 
  <div className="demo-wraper">

    <div className="demo-wraper-left">
      <DemoSidebar/>
    </div>
    <div className="demo-wraper-center" >
        <DemoDiagrams/>
    </div>
  </div>
);
root.render(
  <div style={{height: '80%',margin: 30,width: '90%',background:"#ffc"}}>
    <PanelGroup  direction="horizontal">
      
      <Panel>
        <PanelGroup direction="horizontal">
          <Panel className='right-p'  width={40}>
            右边浮岛
            <div style={{width: "100px", height: '100px'}}></div>
          </Panel>
          <Panel>
            资源
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle/>
      <Panel>
        <PanelGroup  direction="horizontal">
          <Panel fixed={true}>
            <PanelGroup  direction="vertical">
              <Panel>workspace</Panel>
              <PanelResizeHandle/>
              <Panel fixed={true}>feedbackx</Panel>
            </PanelGroup>
          </Panel>
          <Panel className='right-p'  width={20}>
            右边浮岛
            <div style={{width: "100px", height: '100px'}}></div>
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  </div>
)*/

root.render(<DemoLayout/>)

