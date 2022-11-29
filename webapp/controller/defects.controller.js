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

	return Controller.extend("package.AiPackaging.controller.defects", {

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},
		onAfterRendering: function () {
			this.masterimg = this.byId("masterimg");
			this.testimg = this.byId("testimg");
			this.defopimg = this.byId("defopimg");
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
			switch (this.selectedcam) {
			case "masterclick":
				this.masterimagestring = realData;
				this.masterimg.setSrc(img);
				break;
			case "testclick":
				this.testimagestring = realData;
				this.testimg.setSrc(img);
				break;
			}
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
		printcheck: function () {
			var that = this;
			if (this.masterimagestring && this.testimagestring != "") {
				var payload = {
					"master": this.masterimagestring,
					"test": this.testimagestring
				};
				var settings = {
					"async": true,
					"crossDomain": true,
					"url": "/Tetrapak_defects/upload",
					"method": "POST",
					"processData": false,
					"contentType": "application/json",
					accept: "application/json",
					"data": JSON.stringify(payload)
				};
				/* code to send request and parse recieving data
				
					//this.defopimg.setSrc();
					this.byId("scop").setText(); // set score output
					this.byId("accepop").setText(); // set acceptability
					this.byId("status").setText(); // set pass/fail
					*/
				debugger;
				var score = "";
				var img = "";
				var promise = new Promise(function (resolve, reject) {
					$.ajax(settings).success(function (response) {
						img = "data:image/png;base64," + response.result;
						this.testimg.setSrc(img);
						this.testimg.setWidth("100%");
						this.testimg.setHeight("auto");
						//this.byId("scop").setText(response.score);
						//this.byId("outputcontainer").setVisible(true);
						this.byId("score").setPercentage(response.score*100);
						this.byId("opcont").setVisible(true);
					}.bind(that)).error(function (response) {
						MessageBox.error("Something Has Gone Wrong Please Try Again");
					});
				});
				this.defopimg.setWidth("100%");
				this.defopimg.setHeight("100%");
			} else {
				MessageBox.error("Please upload a master and a test image and try again");
			}
		},
		uploaded: function (evt) {
			debugger;
			this.imgname = evt.getSource().sId.split('--')[1];
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
					switch (that.imgname) {
					case "masterupload":
						that.masterimg.setSrc(that.srcFileURL);
						that.masterimagestring = block[1].split(",")[1];
						that.masterimg.setWidth("auto");
						that.masterimg.setHeight("100%");
						break;
					case "testupload":
						that.testimg.setSrc(that.srcFileURL);
						that.testimagestring = block[1].split(",")[1];
						that.testimg.setWidth("100%");
						that.testimg.setHeight("auto");
						break;
					}
				};
			};
			request.send();
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