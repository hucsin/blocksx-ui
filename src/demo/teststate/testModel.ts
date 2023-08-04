import {
    NovusComponent,
    novus,
    NovusBaseModel,
  } from "./base";
  
  export interface ITestState {
    count: number;
  }
  
  export class TestModel extends NovusBaseModel<ITestState> {
    namespace = "testModel";
    constructor() {
      super();
      this.state = {
        count: 0,
      };
    }
    actions = {
      add: (n: number) => {
        this.setState({ count: this.state.count + n });
      },
      minus: (n: number) => {
        this.setState((state) => ({ count: state.count - n }));
      },
    };
  }
  
  export interface ITest2State {}
  
  export class Test2Model extends NovusBaseModel<ITest2State> {
    namespace = "test2Model";
    constructor() {
      super();
      this.state = {};
    }
    actions = {
      doubleAdd: (n: number) => {
        this.getModel('testModel').actions.add(n * 2);
      },
    };
  }
  