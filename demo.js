/**
 * @author djordjev
 */

$(document).ready(function() {
	
	//************************************ FIRST MVC ********************************************************************//
	
	/** Concrete model. */
	var FirstModel = function(){
		/** This function simulates asynchronus message to some server. After being called it wait 3 seconds and dispatch responseReceived event. */
		this.fakeRequest = function(stringToReturn) {
			var self = this;
			setTimeout(function () {
				self.dispatchEvent("responseReceived", {message: stringToReturn + "passed through model"});
			}, 3000);
		};
	};
	FirstModel.prototype = new BaseModel();
	var firstModelObject = new FirstModel();
	
	
	/** Concrete view. */
	var FirstView = function(){};
	FirstView.prototype = new BaseView("firstDiv", "firstTemplate.tpl", firstModelObject);
	var firstViewObject = new FirstView();
	
	var FirstController = function(){
		/** Adds click handler on button on template. */
		this.addEventHandlers = function () {
			$("#templateButton").click(this.clickOnButton);
			this.model.addEventListener("responseReceived", this.responseReceived);
		};
		
		/** On initializeView call fakeRequest. */
		this.initializeView = function () {
			this.model.fakeRequest("Fake Request Function ");
		};
		
		/** Click handler on button. */
		this.clickOnButton = function(event) {
			$("#clickTemplate").html("Click on button is registrated.");
		};
		
		/** Response received handler. */
		this.responseReceived = function(event) {
			$("#responseTemplate").html(event.message);
		};
	};
	FirstController.prototype = new BaseController(firstViewObject, firstModelObject);
	var firstControllerObject = new FirstController();
	firstControllerObject.initialize();
	
	//************************************ SECOND MVC ********************************************************************//
	
	/** Second concrete model used to demonstrate binding functionality */
	var SecondModel = function() {
		/** Bindable variable initialized to 1. */
		this.incrementingInt = new BindableVar(1);
		
		/** Function incrents bindabel variable */
		this.increment = function() {
			this.incrementingInt.setVariable(this.incrementingInt.getVariable() + 1);
		};
	};
	SecondModel.prototype = new BaseModel();
	var secondModelObject = new SecondModel();
	
	/** Second concrete view for binding. */
	var SecondView = function(){};
	SecondView.prototype = new BaseView("secondDiv", "secondTemplate.tpl", secondModelObject);
	var secondViewObject = new SecondView();
	
	var SecondController = function() {
		var self = this;
		
		/** Click handler on button on view. */
		this.addEventHandlers = function () {
			$(document).on('click', "#incrementButton", function(e) {
				e.stopImmediatePropagation();
				self.clickOnIncrementButton();
			});
		};
		
		/** This function only updates variable in model. It never changes view - it's done automatically since it's bindable. */
		this.clickOnIncrementButton = function() {
			self.model.increment();
		};
	};
	SecondController.prototype = new BaseController(secondViewObject, secondModelObject);
	var secondControllerObject = new SecondController();
	secondControllerObject.initialize();
	
});

