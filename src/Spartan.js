var SpartanJS = (function() {

  "use strict";

  var Components = {
    Expando: "SpartanJs" + -new Date(),
    require: function(name, suppressError) {
      var component = Components[name];
      if(component !== undefined || suppressError) {
        return component;
      }
      throw Error("SpartanJS: Component '" + name + "' not registered.");
    },
    register: function(name, Component, suppressError) {
      if(Components[name] === undefined || suppressError) {
        return Components[name] = Component(Components);
      }
      throw Error("SpartanJS: A Component with name '" + name + "' already exists.");
    }
  };

  return Components;

})();