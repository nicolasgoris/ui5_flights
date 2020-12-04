sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/library"
], function (BaseController, JSONModel, formatter, mobileLibrary) {
    "use strict";

    return BaseController.extend("be.ap.flight.controller.Bookings", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                Bookings: []
            });

            this.getRouter().getRoute("bookings").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "bookingsView");

            // this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
        _onObjectMatched: function (oEvent) {
            this.getModel("appView").setProperty("/layout", "ThreeColumnsEndExpanded");
            var oKeys = {
                Carrid: oEvent.getParameter("arguments").Carrid,
                Connid: oEvent.getParameter("arguments").Connid,
                Fldate: oEvent.getParameter("arguments").Fldate
            };
            var sPath = "/" + this.getModel().createKey("FlightSet", oKeys);

            this.getModel().read(sPath, {
                success: function (oData) {
                    this.getModel("bookingsView").setProperty("/Flight", oData);
                }.bind(this)
            });
            this.getModel().read(sPath + "/BookingSet", {
                success: function (oData) {
                    this.getModel("bookingsView").setProperty("/Bookings", oData.results);
                    // this.getModel("bookingsView").setProperty("/busy", false);
                }.bind(this)
            });
        },

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function (sObjectPath) {

        },

        _onMetadataLoaded: function () {
            // Store original busy indicator delay for the detail view
            var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
                oViewModel = this.getModel("bookingsView");
            // oLineItemTable = this.byId("lineItemsList"),
            // iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            oViewModel.setProperty("/delay", 0);
            oViewModel.setProperty("/lineItemTableDelay", 0);

            // oLineItemTable.attachEventOnce("updateFinished", function () {
            //     // Restore original busy indicator delay for line item table
            //     oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
            // });

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
        },

        /**
         * Set the full screen mode to false and navigate to master page
         */
        onCloseBookingsPress: function () {
            // this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
            // No item should be selected on master after detail page is closed
            // this.getOwnerComponent().oListSelector.clearMasterListSelection();
            this.getRouter().navTo("object");
        },

        /**
         * Toggle between full and non full screen mode.
         */
        toggleFullScreen: function () {
            var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
            if (!bFullScreen) {
                // store current layout and go full screen
                this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
                this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
            } else {
                // reset to previous layout
                this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
            }
        }
    });

});