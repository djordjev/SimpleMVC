/**
 * @author djordjev
 */

$(document).ready(function() {
	var View = function(){};
	View.prototype = new BaseView("#testDiv", "template.tpl");
	var viewObject = new View();
	
	var Model = function(){};
	Model.prototype = new BaseModel();
	var modelObject = new Model();
	
	var Controller = function(){
		this.addEventHandlers = function () {
			$("#templateButton").click(this.clickOnButton);
		};
		
		this.clickOnButton = function(event) {
			alert("Frickin click");
		};
	};
	Controller.prototype = new BaseController(viewObject, modelObject);
	var controllerObject = new Controller();
	controllerObject.initialize();
	
});

