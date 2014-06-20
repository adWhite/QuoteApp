var app = app || {};

(function(app) {
    var SelectedOption = Backbone.Model.extend({
        defaults : {
            section: "",
            sectionCost: 0,
            image: ""
        }
    });

    var SelectedOptions = Backbone.Collection.extend({ 
        model: SelectedOption,

        getTotalQuote: function() {
            var total = 0;

            _.each(this.models, function(value, index, collection) {
                total = total + value.attributes.sectionCost;
            });

            return total;
        }
    });

    app.SelectedOption = SelectedOption;
    app.SelectedOptions = SelectedOptions;
})(app);
