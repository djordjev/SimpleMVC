/**
 * @author djordjev
 */

//********************************************************* CONSTANTS *************************************************//

/** Event dispatched when view initialized (template loaded, parsed and added to dom).*/
var VIEW_INITIALIZED = "__view_initialized_";
/** Event dispatched when value of BindableVar is changed. */
var PROPERTY_CHANGED = "__property_changed_";

//********************************************************* EVENT DISPATCHER *************************************************//

/** EventDispatcher object. This is base object for all parts of MVC. Implementation of observer pattern. */
var EventDispatcher = function() {
	/** Dictionary mapping event string to array of callback functions that will be called when event is dispatched. */
	this.listenersMap = new Object();

	/** Function for adding event listener. First argument is event string and second is callback function that will be called when event is dispatched. */
	this.addEventListener = function(eventString, listenerFunction) {
		if (this.listenersMap[eventString] == null) {
			this.listenersMap[eventString] = new Array();
		}
		this.listenersMap[eventString].push(listenerFunction);
	};

	/** Function for removing event listener. Removes callback function for given event string. */
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

	/** Removes all listeners from this event lispatcher. */
	this.removeAllListeners = function() {
		this.listenersMap = new Object();
	};

	/** Dispatch event. First argument is event string. Second argument is event object (
	 * 	every function previously added with addEventListener function for this event string will be called with this event) */
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

/** Bindable variable. This object dispatches PROPERTY_CHANGED when change it's variable. */
var BindableVar = function (value) {
	/** Variable that is wrapped with this object. */
	this.variable = value;
	
	/** Setter for variable. Set new value for variable and dispatch event.*/
	this.setVariable = function(value) {
		var oldValue = this.variable;
		this.variable = value;
		this.dispatchEvent(PROPERTY_CHANGED, {oldValue: oldValue, newValue: value});
	};
	
	/** Returns value of variable */
	this.getVariable = function() {
		return this.variable;
	};
	
	/** Bind one variable to other variable. When variable is binded to other variable, changing value of that other variable will change this variables value. */
	this.bind = function(bindableVariable) {
		var self = this;
		bindableVariable.addEventListener(PROPERTY_CHANGED, this.changedValue);
	};
	
	/** Handler for changed value of binded variable. */
	this.changedValue = function(event) {
		this.variable = event.newValue;
	};
	
	/** Stops listening for changes of other variable*/
	this.unbind = function(bindableVariable) {
		bindableVariable.removeEventListener(PROPERTY_CHANGED, this.changedValue);
	};
};
BindableVar.prototype = new EventDispatcher();

//********************************************************* BASE VIEW *************************************************//

/** This object should be base object for all views. 
 * @param domSelector - id of html element in which this view will be added.
 * @param templateFile - location to template file. Template file is HTML file with placeholders for binding variables. Since view has reference
 * 						to model, it's possible to bind it to some variable in model. That is achived by adding placeholder {{name}} in template file,
 * 						on place where that variable should be inserted. name is name of BindableVar in model.
 * @param model - reference to model. */
var BaseView = function(domSelector, templateFile, model) {
	this.isInitialized = false;
	this.domElement = $("#" + domSelector);
	this.model = model;
	
	var self = this;
	$.ajax({url: templateFile}).done(function(data) {
		self.template = data;
		self.isInitialized = true;
		self.bindVariables();
		self.parseTemplate();
		self.dispatchEvent(VIEW_INITIALIZED, {});
	});
	
	/** For every variable that is binded in template file add event listener for PROPERTY_CHANGED event.*/
	this.bindVariables = function () {
		var self = this;
		this.forEachBindedVariable(function(bindedVariable, varibleName) {
			bindedVariable.addEventListener(PROPERTY_CHANGED, self.refreshView);
		});
	};
	
	/** Change all placeholders from template file with current value of their binded variables. */
	this.parseTemplate = function() {
		var parsedHTML = this.template;
		// get all variables under placeholder
		this.forEachBindedVariable(function(bindedVariable, variableName) {
			parsedHTML = parsedHTML.replace("{{" + variableName + "}}", bindedVariable.variable);
		});
		this.domElement.html(parsedHTML);
	};
	
	/** Iterate througn all placeholders in template file and call function from argument (actionOnVariable) for every occurence of placeholder. */
	this.forEachBindedVariable = function(actionOnVariable) {
		var allBindedVariables = this.template.match(/\{\{[a-zA-Z0-9]*\}\}/g);
		if(allBindedVariables != null) {
			for(var i = 0; i < allBindedVariables.length; i++) {
				var variableName = allBindedVariables[i].substring(2, allBindedVariables[i].length - 2); // remove leading and trailing double curly braces
				var modelVariable = model[variableName];
				if(modelVariable instanceof BindableVar) {
					if(actionOnVariable != null) {
						actionOnVariable(modelVariable, variableName);
					}
				} else {
					console.error("Trying to bind to variable that is not bindable");
				}
			}
		}
	};
	
	/** Handler for PROPERTY_CHANGED event. Parse template and add it to DOM. */
	this.refreshView = function(event) {
		self.parseTemplate();
	};
	
};
BaseView.prototype = new EventDispatcher();


//********************************************************* BASE MODEL *************************************************//

/** Base object for all models. */
var BaseModel = function (){};
BaseModel.prototype = new EventDispatcher();

//********************************************************* BASE CONTROLLER *************************************************//

/** Base object for all controllers.It has references to both model and controller.*/
var BaseController = function(view, model) {
	this.view = view;
	this.model = model;
	
	/** Function will be called when view is initialized. Use this function to add event listeners on view. This function will be called only once.*/
	this.addEventHandlers = function() {};
	/** Function will be called when view is initailized. Use this function to add inital values to view or to initialize model. This function will be called only once. */
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

