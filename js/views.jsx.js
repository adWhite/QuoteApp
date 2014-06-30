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

    var IndexView = React.createClass({
        _start: function() {
            console.log("start!");   
            location.href = "#app";
        },

        render: function() {
            return (
                <div className="app-welcome-view">
                    <img className="adWhite-logo" src="img/adWhite-logo.png" alt="adWhite" />
                    <h1 className="app-title">Quote App</h1>
                    <p className="app-short-description">Quick & Easy Step-by-Step Website Estimate from adWhite</p>
                    <button className="btn-m btn-blue btn-get-started" onClick={this._start}>Get Started</button>
                    <p>A tool made by <a href="http://adWhite.com" target="_blank">adWhite</a></p>
                </div>
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
    var AppView = React.createClass({
        // We get the current route at 0 the first time we render the component
        getInitialState: function() {
            return { 
                current: 0,
                total: 0
            };
        },

        // Mini routing system
        _navigate: function(num) {
            this.setState({ current: num });
        },

        _next: function() {
            // use array index way instead of length number, better said
            // 0 is the first one, instead of 1
            var optionsSize = _.size(app.options) - 1;

            console.log("current: " + this.state.current);
            // if we are in the last section, we are ready to go to the result 
            // route, and do the math
            if (this.state.current < optionsSize) {
                this.setState({ current: this.state.current + 1 }); 
            } else {
                location.href = "#multi";
            }
        },

        _back: function() {
            // change the length for the array indexing way
            var current = this.state.current - 1;

            // if we get back to route 0, set total to 0
            if (this.state.current === 0) {
                this.setState({ total: 0 });
            }

            // go back one number
            this.setState({ current: this.state.current - 1 }); 

            // if we aren't in the first section, then modify the total
            if (current > 0) {
                this._totalMinus(selectedOptions.at(current).attributes.sectionCost);
            } 
            
            // otherwise set it to `0` to avoid issues
            else {
                this.setState({ total: 0 });
            }
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
            console.log("total: " + this.state.total);
        },

        _totalMinus: function(num) {
            this.setState({ total: this.state.total - num });
        },
    
        _renderBackButton: function() {
            if (this.state.current > 0) {
                return <button className="btn-blue-dark btn-s" onClick={this._back}>Go Back</button>;
            } 
        },

        _renderOptions: function() {
            if (this.state.current === 4) {
                return <MultiOptionsView plus={this._totalPlus} /> 
            } else {
                return (     
                    <OptionsView 
                        data={this._getCurrentData(this.state.current)} 
                        current={this.state.current}
                        next={this._next} 
                        plus={this._totalPlus} 
                    />
                );
            }
        },

        // We pass `_next` method to `OptionsView` Component then to `OptionView`
        render: function() {
            return (
                <div className="app-view">
                    <div className="app-estimated-cost"><span className="app-cost">${this.state.total}</span></div>
                    {this._renderOptions()}

                    {this.state.current < 4 ? this._renderBackButton() : null}
                </div>
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
    var OptionsView = React.createClass({
        componentDidUpdate: function() {
            // debug purposes
            console.log(selectedOptions);
        },

        _renderList: function() {
            var that = this;
            return this.props.data.map(function(value, index, collection) {

                // `0` is the name of the section so we don't need it in 
                // the list
                if (index > 0) {
                    return (
                        <OptionView
                            image={value.image}
                            name={value.name}
                            price={value.price}
                            current={that.props.current}
                            next={that.props.next}
                            plus={that.props.plus}
                            section={that.props.data[0]}
                        />
                    );
                }
            });
        },

        render: function() {
            return (
                <div className="app-options-view">
                    {this._renderList()}

                    <h3 className="app-options-view-title">{this.props.data[0]}</h3>
                </div>
            );
        }
    });

    var OptionView = React.createClass({
        _saveOption: function() {
            
            this.props.plus(this.props.price);

            var option = new app.SelectedOption({
                section: this.props.section,
                optionName: this.props.name,
                sectionCost: this.props.price,
                image: this.props.image 
            });

            // animation
            this.refs.feature.getDOMNode().classList.add("spin-out");

            var that = this;
            setTimeout(function() {
                that.props.next();
                that.refs.feature.getDOMNode().classList.remove("spin-out");
            }, 500);
            
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
                    console.log("if");
                    selectedOptions.add(option);
                } 

                // otherwise if we go back we need to set the option at the current model
                else {
                    console.log("else");
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
                <li className="app-feature" onClick={this._saveOption} ref="feature">
                    <img className="app-feature-icon" src={this.props.image} />
                    <i className={this.props.image} />
                    <p className="app-feature-name">{this.props.name}</p>
                </li>
            );
        } 
    });

    /**
     * Total View 
     */

    var TotalView = React.createClass({
        _renderList: function() {
            return this.props.data.map(function(option) {
                var opt = option.attributes;

                return (
                    <ChosenOptionView 
                        image={opt.image} 
                        name={opt.optionName}
                    /> 
                );
            });
        },

        _startAgain: function() {
            location.href = "#";
        },

        render: function() {
            return (
                <div className="app-total-view">
                    <div className="row">
                        <div className="app-total-left col-1-2">
                            <h4>Your Estimate</h4>
                            <hr />
                            <ul className="app-chosen-options">
                                {this._renderList()}
                            </ul>
                            <div className="app-total-amount">
                                ${this.props.total}
                            </div>

                            <div className="asterisk-separator">
                                <i className="fa fa-asterisk"/>
                                <i className="fa fa-asterisk"/>
                                <i className="fa fa-asterisk"/>
                            </div>

                            <button className="btn-blue-dark btn-s" onClick={this._startAgain}>Quote Another Project</button>
                        </div>

                        <div className="app-total-right col-1-2 last">
                            <Branding />
                            <SendQuoteForm />
                        </div>
                    </div>
                </div>
            );  
        }
    });

    /**
     * Multi Options View 
     */

    // Multi options
    // Need to add all the features list to the TotalView, and the cost of all features inside the TotalCost
    // Create the mini routing system with this evaluations too
    var MultiOptionsView = React.createClass({
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
                $els = $('.app-multi-options');

            // if multi options form is present then...
            if ($els) {
                $.each($els.find('input[type="checkbox"]:checked'), function() {
                    total.push($(this).val());
                });

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
                        <Checkbox feature={value.feature} price={value.price} getTotal={this._getChildrensTotal} isTime={value.isTime}  />
                    );
                } else {
                    console.log(value);
                    return <Separator data={value}/>;
                }
            }.bind(this));
        },

        // This is where we save the total to the TotalView
        _goNext: function() {
            // get the total of the local options
            var multiTotal = parseInt(this._getChildrensTotal());

            // save it to show on the total display
            this.props.plus(multiTotal);

            // new model to save on the collection
            var option = new app.SelectedOption({
                section: "Aditional Features",
                optionName: "Aditional Features.",
                sectionCost: multiTotal,
                image: "" 
            });

            // add the model to the collection
            selectedOptions.add(option);

            // go to total
            location.href = "#total"; 
        },

        render: function() {
            return (
                <div className="app-multi">
                    <img className="adWhite-logo" src="img/adWhite-logo.png" alt="adWhite" />

                    <form className="app-multi-options">
                        {this._renderList()}
                    </form>

                    <button className="btn btn-blue btn-m" onClick={this._goNext}>Submit</button>

                    <hr />
                </div>
            );
        }
    });

    var Separator = React.createClass({
        render: function() {
            return (
                <strong>{this.props.data}</strong>
            );
        }
    });

    var Checkbox = React.createClass({
        _getTotal: function() {
            return this.props.getTotal();
        },

        _onChange: function(e) {
            console.log(this._getTotal());
        },

        render: function() {
            return (
                <label className="control checkbox">
                    <input type="checkbox" value={this.props.price} data-name={this.props.feature} data-time={this.props.isTime || false} ref="checkbox" onChange={this._onChange} />
                    <span className="control-indicator"></span>
                    {this.props.feature}
                </label>
            );
        }  
    });

    /**
     * Chosen Option View 
     */

    var ChosenOptionView = React.createClass({
        render: function() {
            return (
                <li>
                    <img className="app-total-icon" src={this.props.image} />
                    <span>{this.props.name}</span>
                </li>
            );     
        }
    });

    /**
     * Send Quote Form 
     */

    var SendQuoteForm = React.createClass({
        render: function() {
            return (
                <form className="app-form-send-quote">
                    <input type="text" placeholder="Your Name"/>
                    <input type="text" placeholder="Your E-Mail"/>
                    <input type="text" placeholder="Copy to yourself or someone else?"/>
                    <input className="btn-green btn-m" type="submit" />
                </form>
            );  
        }
    });

    /**
     * Branding 
     */

    var Branding = React.createClass({
        render: function() {
            return (
                <div className="app-branding">
                    <img className="app-logo" src="img/adWhite_logo.jpg" alt="adWhite" width="80%" /> 

                    <h3>Submit this Quote to us</h3>

                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>
            );
        }
    });

    app.IndexView = IndexView;
    app.AppView = AppView;
    app.TotalView = TotalView;
    app.MultiOptionsView = MultiOptionsView;
    app.selectedOptions = selectedOptions;
})(app);
