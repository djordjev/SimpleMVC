/**
 * @author djordjev
 */

//********************************************************* CONSTANTS *************************************************//

var VIEW_INITIALIZED = "__view_initialized_";
var PROPERTY_CHANGED = "__property_changed_";

//********************************************************* EVENT DISPATCHER *************************************************//

var EventDispatcher = function() {
	this.listenersMap = new Object();

	this.addEventListener = function(eventString, listenerFunction) {
		if (this.listenersMap[eventString] == null) {
			this.listenersMap[eventString] = new Array();
		}
		this.listenersMap[eventString].push(listenerFunction);
	};

	this.removeEventListener = function(eventString, listenerFunction) {
		var arrayOfListenerFunctions = this.listenersMap[eventString];
		if (arrayOfListenerFunctions != null) {
			for (var i = 0; i < arrayOfListenerFunctions.length; i++) {
				if (arrayOfListenerFunctions[i] === listenerFunction) {
					arrayOfListenerFunctions.splice(i, 1);
				}
			}
		}
	};

	this.removeAllListeners = function() {
		this.listenersMap = new Object();
	};

	this.dispatchEvent = function(eventString, event) {
		var arrayOfListenerFunction = this.listenersMap[eventString];
		if (arrayOfListenerFunction != null && arrayOfListenerFunction.length > 0) {
			for (var i = 0; i < arrayOfListenerFunction.length; i++) {
				arrayOfListenerFunction[i](event);
			}
		}
	};
};

//********************************************************* BINDABLE VARIABLE *************************************************//

var BindableVar = function () {
	this.variable = {};
	
	this.setVariable = function(value) {
		var oldValue = this.variable;
		this.variable = value;
		this.dispatchEvent(PROPERTY_CHANGED, {oldValue: oldValue, newValue: value});
	};
	
	this.getVariable = function() {
		return this.variable;
	};
	
	this.bind = function(bindableVariable) {
		var self = this;
		bindableVariable.addEventListener(PROPERTY_CHANGED, this.changedValue);
	};
	
	this.changedValue = function(event) {
		this.variable = event.newValue;
	};
	
	this.unbind = function(bindableVariable) {
		bindableVariable.removeEventListener(PROPERTY_CHANGED, this.changedValue);
	};
};
BindableVar.prototype = new EventDispatcher();

//********************************************************* BASE VIEW *************************************************//

var BaseView = function(domSelector, templateFile, model) {
	this.isInitialized = false;
	this.domElement = $(domSelector);
	this.model = model;
	
	var self = this;
	$.ajax({url: templateFile}).done(function(data) {
		self.template = data;
		self.isInitialized = true;
		self.bindVariables();
		self.parseTemplate();
		self.dispatchEvent(VIEW_INITIALIZED, {});
	});
	
	this.bindVariables = function () {
		var self = this;
		this.forEachBindedVariable(function(bindedVariable, varibleName) {
			bindedVariable.addEventListener(PROPERTY_CHANGED, self.refreshView);
		});
	};
	
	this.parseTemplate = function() {
		var parsedHTML = this.template;
		// get all variables under placeholder
		this.forEachBindedVariable(function(bindedVariable, variableName) {
			parsedHTML.replace("{{" + variableName + "}}", bindedVariable.variable);
		});
		this.domElement.html(parsedHTML);
	};
	
	// the only argument of this function is function that will be called for every binded varable with two arguments: variable itself and variable name in model.
	this.forEachBindedVariable = function(actionOnVariable) {
		var allBindedVariables = this.template.match(/\{\{[a-zA-Z0-9]*\}\}/g);
		if(allBindedVariables != null) {
			for(var i = 0; i < allBindedVariables.length; i++) {
				var variableName = res[i].substring(2, res[i].length - 2); // remove leading and trailing double curly braces
				var modelVariable = model[variableName];
				if(modelVariable instanceof BindableVariable) {
					if(actionOnVariable != null) {
						actionOnVariable(modelVariable, variableName);
					}
				} else {
					console.error("Trying to bind to variable that is not bindable");
				}
			}
		}
	};
	
	this.refreshView = function(event) {
		this.parseTemplate();
	};
	
};
BaseView.prototype = new EventDispatcher();


//********************************************************* BASE MODEL *************************************************//


var BaseModel = function (){};
BaseModel.prototype = new EventDispatcher();

//********************************************************* BASE CONTROLLER *************************************************//


var BaseController = function(view, model) {
	this.view = view;
	this.model = model;

	this.addEventHandlers = function() {};
	this.initializeView = function() {};

	this.initialize = function() {
		if (this.view.isInitialized) {
			this.addEventHandlers();
			this.initializeView();
		} else {
			var self = this;
			view.addEventListener(VIEW_INITIALIZED, function viewInitialized(event) {
				self.addEventHandlers();
				self.initializeView();
			});
		}
	};

}; 

BaseController.prototype = new EventDispatcher();

