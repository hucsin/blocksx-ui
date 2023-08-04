import React, { StrictMode, Suspense, useEffect, useRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NovusComponent,NovusComponent2, novus, NovusBaseModel, TConnectProps } from "./base";
import { TestModel } from './testModel'


type PropsShouldPassToCom = {
  update: Function;
  mapper: Function;
};
type PropsFromModelWithConnect = {
  count: number
}

// 需要在用到的地方定义 应该透传的属性 和 connect 的属性，外部使用 HOC 的时候只需要关心应该透传的属性
novus.bindModel(new TestModel)

export class HelloWorld2 extends React.Component<
  TConnectProps & PropsShouldPassToCom & PropsFromModelWithConnect
> {
  add(n: number) {
    this.props.getModel("testModel").actions.add(n);
  }
  minus(n: number) {
    this.props.getModels()["testModel"].actions.minus(n);
  }
  componentDidUpdate(){
    this.props.update && this.props.update();
  }
  render() {
    return (
      <div>
        <span role="value">{this.props.count}</span>
        <button role="add" onClick={this.add.bind(this, 1)}>
          add
        </button>
        <button role="minus" onClick={this.minus.bind(this, 1)}>
          minus
        </button>
      </div>
    );
  }
}

export const HelloWorldHOC = novus.connect<
  PropsShouldPassToCom,
  PropsFromModelWithConnect
>(
  HelloWorld2,
  (models, novus, props) => {
    props.mapper && props.mapper();
    return {
      count: models.testModel.state.count,
    };
  },
  ["testModel"]
);
export const HelloWorldHOCWithoutDeps = novus.connect<
  PropsShouldPassToCom,
  PropsFromModelWithConnect
>(
  HelloWorld2,
  (models, novus, props) => {
    props.mapper && props.mapper();
    return {
      count: models.testModel.state.count,
    };
  }
);
export const HelloWorldHOCWrap = (props: PropsShouldPassToCom) => {
  const [hide, setHide] = useState(false);
  return (
    <div>
      <button role="hide" onClick={() => setHide(true)}>
        hide
      </button>
      {!hide && <HelloWorldHOC mapper={props.mapper} update={props.update} />}
    </div>
  );
};

export class HelloWorldExtends extends NovusComponent<{}> {
  state = {
    count: 0,
  };
  add() {

    this.setState({count: this.state.count+1});
  }
  render() {
    return (
      <div>
        <span role="value">{this.novus.models.testModel.state.count}</span>
        <span role="value2">{this.state.count}</span>
        <button role="add" onClick={() => {
            this.add();
            this.novus.models.testModel.actions.add(33)
        }}>
          add
        </button>
      </div>
    );
  }
};
export class HelloWorldExtends2 extends NovusComponent2<{}> {
    state = {
      count: 0,
    };
    add() {
  
      this.setState({count: this.state.count+1});
    }
    render() {
      return (
        <div>
          <span role="value">{this.novus.models.testModel.state.count}</span>
          <span role="value2">{this.state.count}</span>
          <button role="add" onClick={() => {
              this.add();
              this.novus.models.testModel.actions.add(33)
          }}>
            add
          </button>
        </div>
      );
    }
  };
