/** @jsx React.DOM */

var app = app || {};

(function(app) {
  var options = app.options,
  features = app.features,
  _wordpress = false;

var selectedOptions = new app.SelectedOptions();

/**
 * Index View 
 */

var IndexView = React.createClass({displayName: 'IndexView',
  _start: function() {
    var $el = $(this.refs.welcome.getDOMNode());

    $el.velocity("transition.bounceOut", function() {
      location.href = "#app";
    });
  },

    render: function() {
      return (
        React.DOM.div( {className:"app-welcome-view animated", ref:"welcome"}, 
        React.DOM.img( {className:"adWhite-logo", src:"img/adWhite-logo.png", alt:"adWhite"} ),
        React.DOM.h1( {className:"app-title"}, "Quote App"),
        React.DOM.p( {className:"app-short-description"}, "Quick & Easy Step-by-Step Website Estimate from adWhite"),
        React.DOM.button( {className:"btn-m btn-black btn-get-started", onClick:this._start}, "Get Started")
        )
        );
    }
});

/**
 * App View 
 */

// This Component will manage the internal routing for navigation and
// pricing stuff.
//
// We will start with 0 since the `app.options` array star from there
// each click event on the `OptionView` will trigger the `AppView._naviate`
// method
var AppView = React.createClass({displayName: 'AppView',
  // We get the current route at 0 the first time we render the component
  getInitialState: function() {
    return { 
      current: 0,
    total: 0
    };
  },

  componentDidMount: function() {
    this.$el = $(this.refs.appView.getDOMNode());

    this.$el.velocity("transition.bounceIn", { stagger: 100, backwards: true});
  },

  // Mini routing system
  _navigate: function(num) {
    this.setState({ current: num });
  },

  _next: function() {
    // use array index way instead of length number, better said
    // 0 is the first one, instead of 1
    
    var optionsSize = _.size(app.options) - 1,
        that = this;

    this.$el.velocity({ 
      opacity: 0 
    }, { 
      complete: function() {
        that.setState({ current: that.state.current + 1 }); 
        that.$el.velocity("transition.slideLeftBigIn", { backwards: true }); 
      } 
    });

    // if we are in the last section, we are ready to go to the result 
    // route, and do the math
    // if (this.state.current < optionsSize) {
    //     this.setState({ current: this.state.current + 1 }); 
    // } else {
    //     location.href = "#total";
    // }
  },

  _back: function() {
    
    // change the length for the array indexing way
    var current = this.state.current - 1,
        that = this;

    this.$el.velocity({ 
      opacity: 0 
    }, {
      complete: function() {
        // if we get back to route 0, set total to 0
        if (that.state.current === 0) {
          that.setState({ total: 0 });
        }

        // go back one number
        that.setState({ current: that.state.current - 1 }); 

        // if we aren't in the first section, then modify the total
        if (current > 0) {
          that._totalMinus(selectedOptions.at(current).attributes.sectionCost);
        } 

        // otherwise set it to `0` to avoid issues
        else {
          that.setState({ total: 0 });
        }

        that.$el.velocity("transition.slideLeftBigIn", { backwards: true }); 
      }
    });
  },

  _getCurrentData: function(index) {
    if (index > _.size(options)) {
      throw "Something wrong with the length of the options"; 
    } else {
      return app.options[index];   
    }
  },

  _totalPlus: function(num) {
    this.setState({ total: this.state.total + num });   
  },

  _totalMinus: function(num) {
    this.setState({ total: this.state.total - num });
  },

  _renderBackButton: function() {
    if (this.state.current > 0) {
      return React.DOM.button( {className:"btn-blue-dark btn-s", onClick:this._back}, "Go Back");
    } 
  },

  _renderOptions: function() {
    window.current = this.state.current;

    // If we used all the options go to "#total"
    if (this.state.current === _.size(app.options) + 1) {
      location.href = "#total";
    } 

    // If we are at the last option, then render the `MultiOptionsView`
    if (this.state.current === _.size(app.options)) {
      return MultiOptionsView( {plus:this._totalPlus} ) 
    } 

    else {
      return (     
          OptionsView( 
          {data:this._getCurrentData(this.state.current), 
          current:this.state.current,
          next:this._next, 
          plus:this._totalPlus} 
          )
          );
    }
  },

  _getStateTotal: function() {
    return accounting.formatMoney(this.state.total);   
  },

  // We pass `_next` method to `OptionsView` Component then to `OptionView`
  render: function() {
    return (
        React.DOM.div( {className:"app-view _hidden", ref:"appView"}, 
          React.DOM.div( {className:"app-estimated-cost"}, React.DOM.span( {className:"app-cost"}, this._getStateTotal())),
          this._renderOptions(),

          this.state.current < 5 ? this._renderBackButton() : null
        )
      );
  }
});

/**
 * Options View 
 */

// We take the `Object` with the list of options needed to get
// the correct price.
//
// We will need to map the `Object` saved on `this.props.data` 
// and render three `OptionView` Components to display the list
// and pass through the `name`, `price` and `image` of each element
var OptionsView = React.createClass({displayName: 'OptionsView',
  componentDidUpdate: function() {
  },

    _renderList: function() {
      var that = this;
      return this.props.data.map(function(value, index, collection) {

        // `0` is the name of the section so we don't need it in 
        // the list
        if (index > 0) {
          return (
            OptionView(
            {image:value.image,
            name:value.name,
            price:value.price,
            current:that.props.current,
            next:that.props.next,
            plus:that.props.plus,
            section:that.props.data[0]}
            )
            );
        }
      });
    },

    render: function() {
      return (
          React.DOM.div( {className:"app-options-view"}, 
          this._renderList(),

          React.DOM.h3( {className:"app-options-view-title"}, this.props.data[0])
          )
          );
    }
});

var OptionView = React.createClass({displayName: 'OptionView',
  _saveOption: function() {

    this.props.plus(this.props.price);

    var option = new app.SelectedOption({
      section: this.props.section,
        optionName: this.props.name,
        sectionCost: this.props.price,
        image: this.props.image 
    });

    // animation
    this.props.next();

    var current = this.props.current,
    collSize = selectedOptions.length; // collection size

// We want to make sure that if we go back a couple options, we can get accurate
// results in the end, that is why we need to remove the models from the collection
// and re save them everytime we go back more than one time

// if the size of the collection is less than the size of the options
// most of the times this is going to be true, unless we write some bad code
    if (collSize < _.size(app.options)) {

      // if everything goes well and we just go each option without going back, this
      // will be used
      if (current === collSize) {
        selectedOptions.add(option);
      } 

      // otherwise if we go back we need to set the option at the current model
      else {
        selectedOptions.at(current).set(option);

        // then we check for the other ones next to this one and delete them all
        // because we are going to choose those again
        if (current < collSize) {
          // we start from the next that where we are, for example if we are in the
          // `2` we start deleting from the `3` and so on
          for (var i = current + 1 ; i < collSize ; i ++) {
            selectedOptions.remove(selectedOptions.at(current));
          }
        }
      }

      // otherwise if we already have a collection, we just modify
      // the current elements
    } else {
      throw "Something wrong with the options size";

    }
  },

    render: function() {
      return (
          React.DOM.li( {className:"app-feature", onClick:this._saveOption, ref:"feature"}, 
          React.DOM.img( {className:"app-feature-icon", src:this.props.image} ),
          React.DOM.i( {className:this.props.image} ),
          React.DOM.p( {className:"app-feature-name"}, this.props.name)
          )
          );
    } 
});

/**
 * Total View 
 */

var TotalView = React.createClass({displayName: 'TotalView',
  componentDidMount: function() {
    $('#app').toggleClass('relativize');
    $(this.refs.appTotal.getDOMNode()).velocity("transition.bounceIn"); 
  },

  componentWillUnmount: function() {
    $('#app').toggleClass('relativize');
  },

  _renderList: function() {
    return this.props.data.map(function(option) {
      var opt = option.attributes;

      return (
        ChosenOptionView( 
          {image:opt.image, 
          name:opt.optionName}
        ) 
        );
    });
  },

  _startAgain: function() {
    location.href = "#";
  },

  _returnPropsTotal: function() {
    return accounting.formatMoney(this.props.total);
  },

  render: function() {
    return (
        React.DOM.div( {className:"app-total-view _hidden", ref:"appTotal"}, 
          React.DOM.div( {className:"row"}, 
            React.DOM.div( {className:"app-total-left col-1-2"}, 
              React.DOM.h4(null, "Your Estimate"),
              React.DOM.hr(null ),

              React.DOM.ul( {className:"app-chosen-options"}, 
                this._renderList()
              ),

              React.DOM.div( {className:"app-total-amount"}, 
                this._returnPropsTotal()
              ),

              React.DOM.div( {className:"asterisk-separator"}, 
                React.DOM.i( {className:"fa fa-asterisk"}),
                React.DOM.i( {className:"fa fa-asterisk"}),
                React.DOM.i( {className:"fa fa-asterisk"})
              ),

              React.DOM.button( {className:"btn-blue-dark btn-s", onClick:this._startAgain}, "Quote Another Project")
            ),

            React.DOM.div( {className:"app-total-right col-1-2 last"}, 
              Branding(null ),
              SendQuoteForm(null )
            )
          )
        )
    );
  }
});

/**
 * Multi Options View 
 */

// Multi options
// Need to add all the features list to the TotalView, and the cost of all features inside the TotalCost
// Create the mini routing system with this evaluations too
var MultiOptionsView = React.createClass({displayName: 'MultiOptionsView',
  componentDidMount: function() {
    $('#app').toggleClass("relativize");   
    $('.app-cost').css({ opacity: 0 });

    if (app.selectedOptions.at(1).attributes.optionName === "WordPress") {
      console.log("is WordPress");
      _wordpress = true;
    } else {
      console.log("doesn't have WordPress");
      _wordpress = false;
    }
  },

  componentWillUnmount: function() {
    $('#app').toggleClass("relativize");   
  },

  getInitialState: function() {
    return { 
      data: [
"What Important Features/Functionality Do You Want/Need? (check all that apply)",
      { feature: "SEO Friendly", price: 190}, 
      { feature: "Blog", price: _wordpress ? 0 : 285 }, 
      { feature: "Submit Form", price: 190 },
      { feature: "Secure Login Access", price: 190 },
      { feature: "Database", price: 285 },
      "What Information Will You Provide? (check all that apply)",
      { feature: "My Logo As Vector Art", price: -95}, 
      { feature: "Copy or Text For Eeach Page", price: -95 }, 
      { feature: "Images or Graphics to use in Design", price: -95 }
] 
    };
  },

  _getChildrensTotal: function() {
    var sum = 0,
    total = [],
    self = this,
    $els = $('.app-multi-options');


    self.optionNames = [];
    self.willProvide = [];

    // if multi options form is present then...
    if ($els) {
      $.each($els.find('input[type="checkbox"]:checked'), function() {
        var optionNamesSize = _.size(self.optionNames);
        var optionWillProvide = _.size(self.willProvide);

        if (optionNamesSize < 5 &&
          $(this).attr('data-name') != self.state.data[7].feature &&
          $(this).attr('data-name') != self.state.data[8].feature &&
          $(this).attr('data-name') != self.state.data[9].feature) {

            self.optionNames.push($(this).attr('data-name'));
        } else {
            self.willProvide.push($(this).attr('data-name'));
        }

        total.push($(this).val());
      });

      console.log(self.willProvide);

      // if array contains at least one element... because reduce can't evaluate empty arrays
      if (total.length > 0) {
        sum = _.reduce(total, function(previousValue, currentValue) {
          return parseInt(previousValue) + parseInt(currentValue);
        });    

        return sum;
      } else {
        return 0;
      }
    }
  },

  _renderList: function() {
    return this.state.data.map(function(value, key) {
      if (value.feature) {
        return (
          Checkbox( {feature:value.feature, price:value.price, getTotal:this._getChildrensTotal, isTime:value.isTime}  )
          );
      } else {
        return Separator( {data:value});
      }
    }.bind(this));
  },

  // This is where we save the total to the TotalView
  _goNext: function() {
    // get the total of the local options
    var multiTotal = parseInt(this._getChildrensTotal());

    if (multiTotal > 0) {
      // save it to show on the total display
      this.props.plus(multiTotal);
      
      var addAmp = function(arr) {
        var last = arr.pop();
        var result = arr.join(", ") + " & " + last;
        return result;
      }

      // new model to save on the collection
      var additionalFeatures = new app.SelectedOption({
        section: "Aditional Features",
        optionName: "Aditional Features: " + addAmp(this.optionNames),
        sectionCost: multiTotal,
        image: "img/icons/layers-2.png" 
      });

      var clientWillProvide = new app.SelectedOption({
        section: "I Will Provide",
        optionName: "I Will Provide: " + addAmp(this.willProvide),
        sectionCost: 0,
        image: "img/icons/clipboard.png"
      });

      // add the model to the collection
      selectedOptions.add(additionalFeatures);
      selectedOptions.add(clientWillProvide);
    }

    $(this.refs.appMulti.getDOMNode()).velocity("transition.bounceOut", { 
      complete: function() {
        // go to total
        location.href = "#total"; 
      }
    });
  },

  render: function() {
    return (
        React.DOM.div( {className:"app-multi", ref:"appMulti"}, 
            React.DOM.form( {className:"app-multi-options"}, 
              this._renderList()
            ),

          React.DOM.button( {className:"btn btn-blue btn-m", onClick:this._goNext}, "Submit")
        )
    );
  }
});

var Separator = React.createClass({displayName: 'Separator',
  render: function() {
    return (
      React.DOM.strong(null, this.props.data)
    );
  }
});

var Checkbox = React.createClass({displayName: 'Checkbox',
  _getTotal: function() {
    return this.props.getTotal();
  },

  _onChange: function(e) {
    console.log("total: " + this._getTotal());
  },

  render: function() {
    return (
      React.DOM.label( {className:"control checkbox"}, 
      React.DOM.input( {type:"checkbox", value:this.props.price, 'data-name':this.props.feature, 'data-time':this.props.isTime || false, ref:"checkbox", onChange:this._onChange} ),
      React.DOM.span( {className:"control-indicator"}),
      React.DOM.span( {className:"checkbox-name"}, this.props.feature)
      )
    );
  }  
});

/**
 * Chosen Option View 
 */

var ChosenOptionView = React.createClass({displayName: 'ChosenOptionView',
  render: function() {
    return (
      React.DOM.li(null, 
        React.DOM.img( {className:"app-total-icon", src:this.props.image} ),
        React.DOM.span(null, this.props.name)
      )
    );     
  }
});

/**
 * Send Quote Form 
 */

var SendQuoteForm = React.createClass({displayName: 'SendQuoteForm',
  componentDidMount: function() {
    this.$form = $('.app-form-send-quote');
    this.$form.validate({
      rules: {
        name: "required",
        email: {
          required: true,
          email: true
        },
        copyto: {
            required: true,
            email: true
          }
      },
      messages: {
        name: "Please specify your name",
        email: {
          required: "We need your email to contact you",
          email: "Your email must be in the format of name@domain.com"
        }
      },
      errorPlacement: function(error, element) {
        $(element).before(error);
      }
    }); 
  },

  _submitForm: function(e) {
    var getEstimate = function() {
      var arr = app.selectedOptions,
          results = [];

      for (var i = 0; i < arr.length; i++) {
        results.push(arr.at(i).attributes.optionName);
      }

      return encodeURIComponent(results.join(", ") + ", Total: " + app.selectedOptions.getTotalQuote().toString());
    };

    if (this.$form.valid()) {
      $.ajax({
        url: "mail.php",
        type: "post",
        data: $(e.target).serialize() + "&estimate=" + getEstimate(),
        success: function() {
          location.href = "#thank-you";
        },
        error: function(xhr, error, status) {
          console.log(xhr, error.message, status);
        }
      });
    } else {
      console.log("invalid!");
    }

    e.preventDefault();    
  },

  render: function() {
    return (
        React.DOM.form( {className:"app-form-send-quote", ref:"form", onSubmit:this._submitForm} , 
          React.DOM.input( {name:"name", type:"text", placeholder:"Your Name (required)"} ),
          React.DOM.input( {name:"company_name", type:"text", placeholder:"Your Company Name (required)"} ),
          React.DOM.input( {name:"email", type:"text", placeholder:"Your E-Mail (required)"} ),
          React.DOM.input( {name:"copyto", type:"text", placeholder:"Copy to yourself or someone else? (required)"} ),
          React.DOM.textarea( {name:"comments", placeholder:"Any comments? (required)"} ),
          React.DOM.input( {className:"btn-orange btn-m", type:"submit"} )
        )
    );  
  }
});

/**
 * Branding 
 */

var Branding = React.createClass({displayName: 'Branding',
  render: function() {
    return (
      React.DOM.div( {className:"app-branding"}, 
        React.DOM.img( {className:"app-logo", src:"img/adWhite_logo.jpg", alt:"adWhite", width:"80%"} ), 

          React.DOM.h3(null, "Submit this Quote to us"),

        React.DOM.p(null, "Thank you for thinking of adWhite for your next website project. Please submit the form below and we’ll be in touch within 24 business hours to discuss next steps.")
      )
    );
  }
});

/**
 * Thank you Page
 */

var ThankYouPageView = React.createClass({displayName: 'ThankYouPageView',
  render: function() {
    return (
      React.DOM.div( {class:"app-thank-you"}, 
        React.DOM.img( {className:"app-logo", src:"img/adWhite_logo.jpg", alt:"adWhite", width:"50%"} ), 

        React.DOM.hr(null ),

        React.DOM.h2(null, "Lorem Ipsum Dolor"),

        React.DOM.p(null, "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.")
      )
    );
  }
});

app.IndexView = IndexView;
app.AppView = AppView;
app.TotalView = TotalView;
app.ThankYouPageView = ThankYouPageView;
app.MultiOptionsView = MultiOptionsView;
app.selectedOptions = selectedOptions;
})(app);
