"use strict";

export class ViewerContextItem {

  constructor(callback, icon, items, name) {

    //Callback to execute for this context menu item
    this.callback = callback;
    //Icon class for this context menu item
    this.icon = icon;
    //Sub items below this context menu item
    this.items = items;
    //Human readable name of this item in the displayed context menu
    this.name = name;
  }
}
