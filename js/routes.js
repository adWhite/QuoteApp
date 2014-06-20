/** @jsx React.DOM */

var app = app || {};

(function(app) {
    var appEl = document.getElementById("app"),

        IndexView = app.IndexView,
        AppView = app.AppView,
        TotalView = app.TotalView,

        Routes = Backbone.Router.extend({
            routes: {
                "": "index",
                "app": "app",
                "total": "total"
            },

            initialize: function() {
                console.log("backbone router initialized!");
            },

            index: function() {
                console.log("index");

                app.selectedOptions.reset();
                React.renderComponent(IndexView(null ), appEl);
            },

            app: function() {
                console.log("app");

                React.renderComponent(AppView(null ), appEl);
            },

            total: function() {
                var total = app.selectedOptions.getTotalQuote();

                if (total === 0) {
                    location.href = "#"; 
                } else {
                    React.renderComponent(TotalView( {data:app.selectedOptions.models, total:total} ), appEl);
                }
            }
        });

    app.Routes = Routes;
})(app);
