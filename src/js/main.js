(function() {
    // var user = 'root';
    // var password = '0penBmc';
    // var ip = 'https://9.3.164.177';
    //
    // var login = {
    //     "type": "POST",
    //     "url": ip + "/login",
    //     "dataType": "json",
    //     "async": false,
    //     "headers": {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json'
    //     },
    //     "xhrFields": {
    //         withCredentials: true
    //     },
    //     "data": JSON.stringify({"data": [user, password]}),
    //     "success": function(response){
    //         console.log(response);
    //     },
    //     "error": function(xhr, textStatus, errorThrown){
    //         console.log("not a successful request!")
    //         console.log(xhr, textStatus, errorThrown)
    //     }
    // };
    //
    // $.ajax(login);

    // Init functions
    header();
    nav();

    // Load logo
    function loadLogo(){
        $('.logo__wrapper').load('logo.html', function(){

            // Grab logo if has ID or not
            var logoID = document.getElementById("header__logo");
            var logo = document.querySelectorAll("img, svg");

            // Has ID - call header height
            if(logoID && logoID !== null) {
                getHeaderHeight();

            // If logo exists but no ID - call header height
            } else if (logo !== null && logo.length == 1){
                   $('img, svg').on('load', function(){
                       getHeaderHeight();
                   })

            // If no logo at all - call header height
            } else { getHeaderHeight(); }
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
            var navWidth = nav.offsetWidth; // Get navigation width
            var subnav = document.getElementsByClassName("nav__second-level");
            var navBtn = document.querySelectorAll('#nav__top-level button');

            // Add body padding to compensate for fixed nav
            document.body.style.paddingLeft = navWidth + 'px';

            // Bump down nav to compensate for fixed header
            nav.style.top = height + 'px';

            // Bump second level nav down for fixed header
            for (var i = 0; i < subnav.length; i++) {
                subnav[i].style.top = height + 'px';
            }

            // Loop over nav buttons
            for (var i = 0, len = navBtn.length; i < len; i++) {

                // Click event for each nav button
                navBtn[i].addEventListener('click', function(){
                    var parent = $(this).parents("#navigation");
                    var btnId = $(this).attr("class").match(/btn[\w-]*\b/);
                    var subnavClass = $('.nav__second-level.' + btnId);

                    // Remove opened class from buttons
                    parent.find('.opened').removeClass('opened');

                    // Add opened class to clicked button
                    this.classList.add("opened");

                    // Close all sub panels and remove opened class
                    parent.find('.nav__second-level').css("left", '-' + navWidth + "px").removeClass('opened');

                    // Open sub panels that matches clicked button and add opened class
                    parent.find(subnavClass).addClass('opened').css("left", navWidth);
                })

            }

            // Temp solution to close subnav - TODO: better way to close
            for (var i = 0, len = subnav.length; i < len; i++) {
                subnav[i].addEventListener('click', function(){
                    this.classList.remove("opened");
                    this.style.left = "-" + navWidth + "px";
                })
            }

        });
    }

}());
