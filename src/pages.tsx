import React from 'react';
import { createRoot } from "react-dom/client";
import FlowPages from './pages/components/FlowPages'

import './style.css';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
//@ts-ignore
let pathname: string = window.location.pathname.replace(/\/pages\//, '')

root.render(<FlowPages name={decodeURIComponent(pathname)}/>)
//root.render(<SqlParser/>)
