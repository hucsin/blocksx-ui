import React from 'react';

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';



const DragHandle = SortableHandle(()=> {
  return (
    <div
      className='former-editor-object-draghandle'
    ></div>
  )
})


class Sortable {

  SortableContainer = SortableContainer(({children}) => {
    return <div className='former-editor-object'>{children}</div>;
  });
  SortableItem =  SortableElement(({children}) => (
    <div className='former-editor-object-item'>
      <DragHandle />

      {children}
    </div>
  ))
}

export default new Sortable;