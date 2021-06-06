class ViewerContextItem{
 
    constructor(){
            
    //$(function(){ 
        $.contextMenu({
             selector: 'html', //.context-menu-one
             callback: function(key, options) {
             var msg = "clicked: " + key;
             window.console && console.log(msg) || alert(msg); 
            },//
             items: {
             "edit": {name: "Edit", icon: "edit"},
             "cut": {name: "Cut", icon: "cut"},
             "copy": {name: "Copy", icon: "copy"},
             "paste": {name: "Paste", icon: "paste"},
             "delete": {name: "Delete", icon: "delete"},
             "sep1": "-------------------",
             "quit": {name: "Quit", icon: "quit"}
           }
        });

      $('html').on('click', function(e){
      console.log('clicked', this);
       });
   // });

  }

}
