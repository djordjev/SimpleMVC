/**
 * @author djordjev
 */

//********************************************************* CONSTANTS *************************************************//

var VIEW_INITIALIZED = "__view_initialized_";

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

//********************************************************* BASE VIEW *************************************************//

var BaseView = function(domSelector, templateFile) {
	this.isInitialized = false;
	this.domElement = $(domSelector);
	
	var self = this;
	$.ajax({url: templateFile}).done(function(data) {
		self.html = data;
		self.isInitialized = true;
		self.render();
		self.dispatchEvent(VIEW_INITIALIZED, {});
	});
	
	this.render = function () {
		this.domElement.html(this.html);
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
	
	this.addEventHandlers = function (){};
	this.initializeView = function(){};
	
	this.initialize = function () {
		if(this.view.isInitialized) {
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
