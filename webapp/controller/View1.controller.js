sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/DialogType",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/ui/core/ValueState",
	"sap/m/MessageBox"
], function (Controller, Button, Dialog, Fragment, JSONModel, DialogType, ButtonType, Text, ValueState, MessageBox) {
	"use strict";

	return Controller.extend("package.AiPackaging.controller.View1", {
		onInit: function () {
			var oView = this.getView();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},
		print: function()
		{
			this.oRouter.navTo("defects");
		},
		count: function()
		{
			this.oRouter.navTo("vision");
		},
		pack: function()
		{
			
		}
	});
});