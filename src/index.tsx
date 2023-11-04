import React from 'react';
import { createRoot } from "react-dom/client";


import LayoutContainerDemo from './demo/ScenFlow';
import './style.css';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

// /general/product
// /setting/other


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

root.render(<LayoutContainerDemo/>)

