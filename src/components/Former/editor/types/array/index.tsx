import React from 'react';

import { IFormerArray } from '../../../typings';

export interface EditorObjectProps {
  fieldKey?: string;
  value: IFormerArray;
  onChange?: Function;
}

export default class FormerEditorArray extends React.PureComponent {
  public constructor(props) {
    super(props);
  }
  
  public render() {
    
    return (
      <div className='former-editor-array'>
        2
      </div>
    )

  }
}