// ==UserScript==
// @name         Plugin filters for WordPress
// @namespace    https://tampermonkey.net/
// @version      1.0.0
// @description  Replaces the plugin filters at the top of the plugins page in WordPress. Filtering is instant.
// @author       Andras Guseo
// @match        http*://*/wp-admin/plugins.php*
// @icon         https://www.google.com/s2/favicons?domain=wordpress.org
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    var log = false;

    var hideOriginalFilter = true;

    if ( log ) { console.log( 'Starting filter script' ); }

    // Plugins and their dataslugs of their assets
    var plugins = {
        "TEC Portfolio"          : { dataslug: "portfolio" },
        "The Events Calendar"    : { dataslug: "the-events-calendar" },
        "Events Calendar Pro"    : { dataslug: "events-calendar-pro#the-events-calendar-pro" },
        "Virtual Events"         : { dataslug: "the-events-calendar-virtual-events#events-virtual" },
        "Filter Bar"             : { dataslug: "the-events-calendar-filter-bar#tribe-filterbar" },
        "Event Tickets"          : { dataslug: "event-tickets" },
        "Event Tickets Plus"     : { dataslug: "event-tickets-plus" },
        "Community Events"       : { dataslug: "the-events-calendar-community-events#events-community" },
        "Community Tickets"      : { dataslug: "the-events-calendar-community-events-tickets#events-community-tickets" },
        "Extensions"             : { dataslug: "extension" },
    };

    if ( log ) { console.log( 'plugins object ready' ); }

    function renderHtml() {
        var html;

        html = '<div id="filter-container" style="clear: both;">';
        html += '<a id="showAll" href="javascript:void(0);">All (' + getAllCount() + ')</a>';
        html += ' | <a id="showActive" href="javascript:void(0);">Active (' + getActiveCount() + ')</a>';
        html += ' | <a id="showInactive" href="javascript:void(0);">Inactive (' + getInactiveCount() + ')</a>';
        html += ' | <a id="showUpdateAvailable" href="javascript:void(0);">Update Available (' + getUpdateCount() + ')</a>';
        for ( var product in plugins ) {
            html += ' | <a href="javascript:void(0);" id="filter-' + plugins[product].dataslug + '">';
            html += '' + product + '';
            html += '</a>';
        }
        if ( hideOriginalFilter ) {
            html += ' | <a id="showOriginalFilter" href="javascript:void(0);">(O)</a>';
        }
        html += '</div>';
        html += '<style>#filter-container a { text-decoration: none;} #filter-container a:hover { text-decoration: underline;} #filter-container a:focus { font-weight: 600;}</style>';

        return html;
    }

    if ( log ) { console.log( 'renderHtml function ready' ); }

    // Selecting all the rows
    var pluginrows = document.querySelectorAll(".wp-list-table.plugins tbody tr");

    // Function to hide all rows and show the required ones
    function hideIt( show ){
        if ( log ) { console.log( 'Hiding all' ); }

        // Hiding all rows
        for( var i=0; i<pluginrows.length; i++ ){
            pluginrows[i].style.display = 'none';
        }

        var pluginSlug = show.replace( 'filter-', '' );
        var selector;

        // Showing the selected rows
        if ( pluginSlug == 'extension' ) {
            selector = '[data-slug*="' + pluginSlug + '"]';

            if ( log ) { console.log( 'Showing ' + selector ); }

            var rows = document.querySelectorAll(selector);
            for ( var j=0; j<rows.length; j++) {
                rows[j].style.display = 'table-row';
            }
        }
        else if ( pluginSlug == 'portfolio' ) {
            for ( var plugin in plugins ) {
                if ( plugins[plugin].dataslug != 'portfolio' && plugins[plugin].dataslug != 'extension' ) {
                    console.log('this ' + plugins[plugin].dataslug);
                    showRow( plugins[plugin].dataslug );
                }
            }
        }
        else {
            showRow( pluginSlug );
        }
    }

    // Function to show all rows
    function showAll() {
        if ( log ) console.log( 'Showing all plugins' );
        for( var i=0; i<pluginrows.length; i++ ){
            pluginrows[i].style.display = 'table-row';
        }
    }

    function getCount( selector ) {
        var rows = document.querySelectorAll( selector );
        return rows.length;
    }
    function getAllCount() {
        // We deduct 2 for the header and footer rows
        return getCount( 'table.wp-list-table.plugins tr' )-getCount( 'table.wp-list-table.plugins tr.plugin-update-tr' )-2;
    }

    function getActiveCount() {
        return getCount( 'tr.active' )-getCount( 'tr.plugin-update-tr.active' );
    }

    function getInactiveCount() {
        return getCount( 'tr.inactive' )-getCount( 'tr.plugin-update-tr.inactive' );
    }

    function getUpdateCount() {
        return getCount( 'tr.plugin-update-tr' );
    }

    // Function to hide all rows
    function hideAll() {
        if ( log ) console.log( 'Hiding all plugins' );
        for( var i=0; i<pluginrows.length; i++ ){
            pluginrows[i].style.display = 'none';
        }
    }

    // Function to show all with a certain selector
    function showSelector( selector ) {
        if ( log ) console.log( 'Showing all rows with the "' + selector + '" selector' );
        var rows = document.querySelectorAll( selector );
        for( var i=0; i<rows.length; i++ ){
            rows[i].style.display = 'table-row';
        }
    }

    // Function to show a selected row
    function showRow( pluginSlug ) {
        if ( log ) { console.log( 'Showing ' + pluginSlug ); }

        if ( pluginSlug.search('#') > 0 ) {
            console.log('More slugs. Splitting.');
            pluginSlug = pluginSlug.split('#');
            if ( log ) console.log( 'Array: ' + pluginSlug);
        }
/*        else{
            console.log('not array');
        }*/

        // If array
        if ( Array.isArray(pluginSlug) == true ) {
            pluginSlug.forEach(showSelected);
        }
        // If single
        else {
            showSelected(pluginSlug);
            /*var selector = "[data-slug='" + pluginSlug + "']";

            if ( document.querySelector(selector) == null ) {
                console.log( 'Plugin with slug "' + pluginSlug + '" doesnt exist.' );
                return;
            }
            document.querySelector(selector).style.display = 'table-row';*/
        }
    }

    function showSelected(pluginSlug, index) {
        var selector = "[data-slug='" + pluginSlug + "']";
        if ( document.querySelector(selector) == null ) {
            console.log( 'Plugin with slug "' + pluginSlug + '" doesnt exist.' );
            return;
        }
        document.querySelector(selector).style.display = 'table-row';
    }

    // Container of the original filters on the plugins page
    var filters = document.getElementsByClassName('subsubsub')[0];

    // Adding filters to the top of the page
    filters.insertAdjacentHTML( 'afterend', renderHtml() );
    if ( log ) { console.log( 'Added filters' ) };

    // Adding event listener
    document.getElementById("filter-container").addEventListener("click", function( e ) {
        if ( log ) { console.log( 'Targeting ' + e.target.id ); }

        if ( e.target.id == 'showAll' ) {
            showAll();
        }
        else if ( e.target.id == 'showActive' ) {
            hideAll();
            showSelector('tr.active');
        }
        else if ( e.target.id == 'showInactive' ) {
            hideAll();
            showSelector('tr.inactive');
        }
        else if ( e.target.id == 'showUpdateAvailable' ) {
            hideAll();
            showSelector('tr.update');
            showSelector('tr.plugin-update-tr');
        }
        else if ( e.target.id == 'showOriginalFilter' ) {
            document.querySelector('ul.subsubsub').style.display = 'initial';
        }
        else {
            hideIt( e.target.id );
        }
    });

    if ( hideOriginalFilter ) {
        document.querySelector('ul.subsubsub').style.display = 'none';
    }

})();
