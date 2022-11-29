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
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
], function (Controller, Button, Dialog, Fragment, JSONModel, DialogType, ButtonType, Text, ValueState, MessageBox, History) {
	"use strict";

	return Controller.extend("package.AiPackaging.controller.vision", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},
		onAfterRendering: function () {
			this.countimg = this.byId("countimg");
			this.countopimg = this.byId("countopimg");
		},
		uploaded: function (evt) {
			this.imgname = evt.getSource().getButtonText();
			this.srcFileURL = null;
			this.srcFileName = null;
			this.srcFile = null;
			this.imgstring = "";
			// keep a reference of the uploaded file name and create a url out of that when this is an image
			this.srcFile = evt.oSource.oFileUpload.files[0];
			this.srcFileName = this.srcFile.name;
			if (this.srcFile.type.match("image.*")) {
				this.srcFileURL = URL.createObjectURL(this.srcFile);
			}
			var request = new XMLHttpRequest();
			request.open('GET', this.srcFileURL, true);
			request.responseType = 'blob';
			var that = this;
			request.onload = function () {
				var reader = new FileReader();
				reader.readAsDataURL(request.response);
				reader.onload = function (e) {
					var img = e.target.result;
					var block = img.split(";");
					that.countimg.setSrc(that.srcFileURL);
					that.countimagestring = block[1].split(",")[1];
			/*		that.countimg.setWidth("auto");
					that.countimg.setHeight("500px");*/

				};
			};
			request.send();
		},
		opencam: function (evt) {
			this.selectedcam = evt.getSource().sId.split('--')[2];
			this._oPopover = null;
			if (sap.ui.getCore().byId("camerabox")) {
				sap.ui.getCore().byId("camerabox").destroy();
			}
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("package.AiPackaging.view.CopyOfcamera", this);
				this.getView().addDependent(this._oPopover);
			}
			this._oPopover.openBy(evt.getSource());
		},
		handleCapture: function () {
			var iVideoWidth = sap.ui.getCore().byId("idCamera").getVideoWidth();
			var iVideoHeight = sap.ui.getCore().byId("idCamera").getVideoHeight();
			var oImage = sap.ui.getCore().byId("idCamera")._takePicture(iVideoWidth, iVideoHeight);
			sap.ui.getCore().byId("idCamera").fireSnapshot({
				image: oImage
			});
		},
		onSnapshot: function (oEvent) {
			var img = oEvent.getParameter("image");
			var block = img.split(";");
			var realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
			this.countimagestring = realData;
			this.countimg.setSrc(img);
		/*	this.countimg.setWidth("100%");
			this.countimg.setHeight("500px");*/
			this.countimg.addStyleClass("image");
			if (this._oPopover) {
				sap.ui.getCore().byId("idCamera").stopCamera();
				this.getView().removeDependent(this._oPopover);
				this._oPopover.destroy();
			}
		},
		handleCloseButton: function () {
			if (this._oPopover) {
				sap.ui.getCore().byId("idCamera").stopCamera();
				this.getView().removeDependent(this._oPopover);
				this._oPopover.destroy();
			}
		},
		count: function () {
			var that = this;
			var img = "";
			var idx = this.byId("viewtype").getSelectedIndex();
			var perspective = "2";
			if (idx == 1) {
				perspective = "1";
			}
			if (this.countimagestring != "") {
				var payload = {
					"count": perspective,
					"image": this.countimagestring
				};
				var settings = {
					"async": true,
					"crossDomain": true,
					"url": "/Vision_counting/upload",
					"method": "POST",
					"processData": false,
					"contentType": "application/json",
					accept: "application/json",
					"data": JSON.stringify(payload)
				};
				var promise = new Promise(function (resolve, reject) {
					$.ajax(settings).success(function (response) {
						img = "data:image/png;base64," + response.image;
						this.byId("countopimg").setSrc(img);
					/*	this.byId("countopimg").setWidth("400px");
						this.byId("countopimg").setHeight("auto");*/
						//this.byId("counttext").setText(response.counts);
						this.byId("countopcontainer").setVisible(true);
					
					}.bind(that)).error(function (response) {
						MessageBox.error("Something has gone wrong Please Try Again");
					});
				});
			} else {
				MessageBox.error("Please upload a test image and try again");
			}
		},
		goback: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.oRouter.navTo("TargetView1", {}, true /*no history*/ );
			}
		}
	});

});