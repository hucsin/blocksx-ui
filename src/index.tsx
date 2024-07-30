import React from 'react';
import { createRoot } from "react-dom/client";

import { Button } from 'antd';
import Icon from './components/Former/types/icon';
//import SqlParser from './demo/Sqlparser'
//import Editor from './components/EditorCore/index';
//import CardList from './components/CardList/index';
import Box from './components/Box/index';

import LayoutLoginDemo from './demo/Login';
import RouterLayout from './components/RouterLayout';

import SmartPage from './components/SmartPage';

import PageWorkflowDetail from './pages/PageWorkflowDetail';

import './style.css';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

// /general/product
// /setting/other

class Text404 extends React.Component<{text: string}, {value:string, type: number}> {
  public constructor(props:any) {
    super(props);
    this.state = {
      value: '',
      type: 0
    }
  }
  public doClick = ()=> {
    let screenWidth = window.screen.width;
    let screenHeight = window.screen.height;
    let windowWidth = Math.min(1000, screenWidth -  300);
    let windowHeight = Math.min(700, screenHeight - 200);
    let windowhelper: any = null;
    
  windowhelper =  window.open("api/connections/auth?id=4", "newWindow", );
  windowhelper.addEventListener('message', function(event) {
    // event.data 包含发送过来的消息内容
    console.log('Message from child window:', event.data);

    if (windowhelper) {
      //windowhelper.close();
      //windowhelper = null;
    }
});
  }
  public render() {
    return (
      <div style={{padding: '0px', height: '100%', 'paddingTop': 30, boxSizing: 'border-box',overflow: 'hidden',position: 'relative'}}>
        <a  onClick={this.doClick} >dd</a>
        <div style={{height: 30, position: 'absolute', left: 0, top: 0, width: '100%', borderBottom: '1px solid #ccc'}}>
          <Button onClick={()=>this.setState({type: 0})}>1</Button><Button onClick={()=>this.setState({type: 1})}>2</Button>
        </div>
        <div style={{display: this.state.type == 0 ?'block' : 'none', height: '100%'}} >
        
        </div>
        <div style={{display: this.state.type == 1 ?'block' : 'none', height: '100%'}} >
         
        </div>
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
      <div style={{margin: 200, height: '100%', boxSizing: 'border-box'}}>
        
        <Button onClick={() => this.setState({open: true})}>go</Button>
        <SmartPage simplicity uiType='former' type="drawer" name="workflow" open={this.state.open}></SmartPage>

        <SmartPage simplicity uiType='former' title="Node Setting" name="testing" type='popover'  >
          <Button> test</Button>
        </SmartPage>

      </div>
    )
  }
}

class PageHome extends React.Component{
  public render() {
    return (
      <div style={{
        padding: '5% 10%',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'auto'
      }}>
        
        <Box
          dataSource={[
            {
              title: "Harness the power of a developer1",
              type: 'card',
              colspan: 3,
              layout: 'center',
              theme: 'section',
              description: 'Design and build complex workflows, without the complexity of coding.',
              items: [
                {
                  title: 'title',
                  avatar: 'InboxUtilityOutlined',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: 'ccn',
                  avatar: 'SlidersFilled',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: '333',
                  avatar: 'HomeUtilityOutlined',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: 'title',
                  avatar: 'InboxUtilityOutlined',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: 'ccn',
                  avatar: 'SlidersFilled',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: '333',
                  avatar: 'HomeUtilityOutlined',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                }
              ]
            },
            {
              title: "Harness the power of a developer2",
              type: 'card',
              colspan: 3,
              description: 'Design and build complex workflows, without.',
              items: [
                {
                  title: 'title',
                  type: 'markdown',
                  description: 'Leveraging Facebook Lead Ads.'
                },
                {
                  title: 'ccn',
                  type: 'markdown',
                  description: 'Leveraging Facebook Lead Ads.'
                },
                {
                  title: '333',
                  type: 'markdown',
                  description: 'Leveraging Ads performance.'
                }
              ]
            },
            {
              title: "Harness the power of a developer3",
              type: 'card',
              colspan: 2,
              description: 'Design and build complex workflows, without the complexity of coding.',
              items: [
                {
                  title: 'Facebook Lead Ads x Make',
                  image: 'https://media.candulabs.com/1908/fbla-webinar.png',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: 'Facebook Lead Ads x Make',
                  image: 'https://media.candulabs.com/1908/fbla-webinar.png',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: 'Facebook Lead Ads x Make',
                  image: 'https://media.candulabs.com/1908/fbla-webinar.png',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: 'Facebook Lead Ads x Make',
                  image: 'https://media.candulabs.com/1908/fbla-webinar.png',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: 'Facebook Lead Ads x Make',
                  image: 'https://media.candulabs.com/1908/fbla-webinar.png',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                },
                {
                  title: 'Facebook Lead Ads x Make',
                  image: 'https://media.candulabs.com/1908/fbla-webinar.png',
                  description: 'Leveraging Facebook Lead Ads data to maximize campaign performance.'
                }
              ]
            },
            {
              title: "Harness the power of a developer4",
              type: 'outline',
              description: 'Design and build complex workflows, without the complexity of coding.Design and build complex workflows, without the complexity of coding.Design and build complex workflows, without the complexity of coding.',
              icon: ['PricingUtilityOutlined'],
              actions: [
                {
                  text: 'Harness',icon: 'HelpUtilityOutlined',
                  action: 'ac'
                },
                {
                  text: 'Harness',icon: 'HelpUtilityOutlined',
                  action: 'ac'
                }
              ],
              tags: [
                {
                  text: 'x',
                  icon: 'HelpUtilityOutlined'
                },
                {
                  text: 'x',
                  icon: 'HelpUtilityOutlined'
                }
              ]
            }
          ]}
        />
      </div>
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
          PageNotFound: Text404,
          PageLogin: LayoutLoginDemo,
          WorkflowDetail: PageWorkflowDetail,
          PageHome: PageHome
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
//root.render(<SqlParser/>)
