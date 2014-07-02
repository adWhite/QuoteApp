var app = app || {};

(function(app) {
    var options = [
            // Site Structure
            [
                "Site Structure",

                {
                    name: "Static, Desktop Optimized",
                    image: "img/icons/imac.png",
                    price: 1805 
                },

                {
                    name: "Responsive",
                    image: "img/icons/responsive.png",
                    price: 2375 
                }
            ],

            // Platform
            [
                "Platform",

                {
                    name: "HTML5",
                    image: "img/icons/html5.png",
                    price: 0 
                },

                {
                    name: "WordPress",
                    image: "img/icons/wordpress.png",
                    price: 250
                }
            ],

            // Design
            [
                "Design",

                {
                    name: "Custom Design from Scratch",
                    image: "img/icons/pencil.png",
                    price: 570 
                },
                
                {
                    name: "Based on a Template",
                    image: "img/icons/PSD-2.png",
                    price: 190 
                }
            ],

            // Site Size
            [
                "Site Size",

                {
                    name: "5 pages or less",
                    image: "img/icons/text2.png",
                    price: 0 
                },
                
                {
                    name: "6 to 15 pages",
                    image: "img/icons/text2.png",
                    price: 427.5
                },
                
                {
                    name: "16 to 30 pages",
                    image: "img/icons/text2.png",
                    price: 1377.5 
                }
            ],

            // Time 
            [
                "Time Frame",
                {
                    name: "Two Weeks or Less",
                    image: "img/icons/watch.png",
                    price: 475
                },

                {
                    name: "Two to Four Weeks",
                    image: "img/icons/alarm-clock.png",
                    price: 0 
                },
                {
                    name: "A Month or Longer",
                    image: "img/icons/clock.png",
                    price: -285
                }
            ]
        ];

    app.options = options;
})(app);
