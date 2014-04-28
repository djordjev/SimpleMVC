/**
 * @author djordjev
 */

$(document).ready(function() {
	
	//************************************ FIRST MVC ********************************************************************//
	
	var FirstModel = function(){
		this.fakeRequest = function(stringToReturn) {
			var self = this;
			setTimeout(function () {
				self.dispatchEvent("responseReceived", {message: stringToReturn});
			}, 3000);
		};
	};
	FirstModel.prototype = new BaseModel();
	var firstModelObject = new FirstModel();
	
	
	var FirstView = function(){};
	FirstView.prototype = new BaseView("firstDiv", "firstTemplate.tpl", firstModelObject);
	var firstViewObject = new FirstView();
	
	var FirstController = function(){
		this.addEventHandlers = function () {
			$("#templateButton").click(this.clickOnButton);
		};
		
		this.initializeView = function () {
			this.model.fakeRequest("Djordje Car");
		};
		
		this.clickOnButton = function(event) {
			$("#clickTemplate").html("Frickin click");
		};
		
		this.responseReceived = function(event) {
			$("#responseTemplate").html(event.message);
		};
	};
	FirstController.prototype = new BaseController(firstViewObject, firstModelObject);
	var firstControllerObject = new FirstController();
	firstControllerObject.initialize();
	
	//************************************ SECOND MVC ********************************************************************//
	
	var SecondModel = function() {
		this.incrementingInt = new BindableVar(1);
		
		this.increment = function() {
			this.incrementingInt.setVariable(++this.incrementingInt.variable);
		};
	};
	SecondModel.prototype = new BaseModel();
	var secondModelObject = new SecondModel();
	
	var SecondView = function(){};
	SecondView.prototype = new BaseView("secondDiv", "secondTemplate.tpl", secondModelObject);
	var secondViewObject = new SecondView();
	
	var SecondController = function() {
		var self = this;
		
		this.addEventHandlers = function () {
		//	$("#incrementButton").click(this.clickOnIncrementButton);
			$(document).on('click', "#incrementButton", this.clickOnIncrementButton);
		};
		
		this.clickOnIncrementButton = function() {
			console.log("calling increment");
			self.model.increment();
		};
	};
	SecondController.prototype = new BaseController(secondViewObject, secondModelObject);
	var secondControllerObject = new SecondController();
	secondControllerObject.initialize();
	
});

