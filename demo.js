/**
 * @author djordjev
 */

$(document).ready(function() {
	var View = function(){};
	View.prototype = new BaseView("#testDiv", "template.tpl");
	var viewObject = new View();
	
	var Model = function(){
		this.fakeRequest = function(stringToReturn) {
			var self = this;
			setTimeout(function () {
				self.dispatchEvent("responseReceived", {message: stringToReturn});
			}, 3000);
		};
	};
	Model.prototype = new BaseModel();
	var modelObject = new Model();
	
	var Controller = function(){
		this.addEventHandlers = function () {
			$("#templateButton").click(this.clickOnButton);
			this.model.addEventListener("responseReceived", this.responseReceived);
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
	Controller.prototype = new BaseController(viewObject, modelObject);
	var controllerObject = new Controller();
	controllerObject.initialize();
	
});

