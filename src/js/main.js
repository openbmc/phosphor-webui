(function () {

    // Init functions
    header();
    nav();

    // Load logo
    function loadLogo() {
        $('.logo__wrapper').load('logo.html', function () {

            // Grab logo if has ID or not
            var logoID = document.getElementById("header__logo");
            var logo = document.querySelectorAll("img, svg");

            // Has ID - call header height
            if (logoID && logoID !== null) {
                getHeaderHeight();

                // If logo exists but no ID - call header height
            } else if (logo !== null && logo.length == 1) {
                $('img, svg').on('load', function () {
                    getHeaderHeight();
                });

                // If no logo at all - call header height
            } else {
                getHeaderHeight();
            }
        });
    }

    // Get header height
    function getHeaderHeight() {
        // Get header height after logo is loaded
        var header = document.getElementById("header__wrapper");
        var headerHeight = header.offsetHeight;

        // Add body padding to compensate for fixed header
        document.body.style.paddingTop = headerHeight + 'px';

        nav(headerHeight);
    }

    // Include header
    function header() {
        $('#header__wrapper').load('header.html', function () {

            // include logo into header
            loadLogo();
        })
    }

    // load navigation - pass in header height
    function nav(height) {
        $('#navigation').load('navigation.html', function (headerHeight) {

            var nav = document.getElementById("nav__top-level");
            var subnav = document.getElementsByClassName("nav__second-level");
            var navBtn = document.querySelectorAll('#nav__top-level button');


            // Bump down nav to compensate for fixed header
            nav.style.top = height + 'px';

            // Bump second level nav down for fixed header
            for (var i = 0; i < subnav.length; i++) {
                subnav[i].style.top = height + 'px';
            }

            //Loop over nav buttons
            for (var i = 0, len = navBtn.length; i < len; i++) {

                // Click event for each nav button
                navBtn[i].addEventListener('click', function () {
                    var parent = $(this).parents("#navigation");
                    var btnId = $(this).attr("class").match(/btn[\w-]*\b/);
                    var subnavClass = $('.nav__second-level.' + btnId);

                    //Remove opened class from buttons
                    parent.find('.opened').removeClass('opened');

                    // Add opened class to clicked button
                    this.classList.add("opened");

                    //Close all sub panels and remove opened class
                    parent.find('.nav__second-level').css("display", "none").removeClass('opened');

                    // add opened class
                    parent.find(subnavClass).css("display", "block").addClass('opened');

                });

            }
        });
    }

}());
