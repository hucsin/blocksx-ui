import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";


import './style.css';

import DemoSidebar from './demo/Sidebar';
import DemoDiagrams from './demo/Diagrams';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
// /general/product
// /setting/other

root.render(
  <div className="demo-wraper">
    <div className="demo-wraper-left">
      <DemoSidebar/>
    </div>
    <div className="demo-wraper-center" style={{padding: '40px'}}>
        <DemoDiagrams/>
    </div>
  </div>
);
