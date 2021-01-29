namespace App {
  export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
  }

  export interface DragTarget {
    //signal the browser and JS that the thing you're dragging something over is a valid drag target
    dragOverHandler(event: DragEvent): void;
    //to react to the actual drop that happens
    dropHandler(event: DragEvent): void;
    //can update our data, UI, give some visual feedback or to revert our visual update
    dragLeaveHandler(event: DragEvent): void;
  }
}