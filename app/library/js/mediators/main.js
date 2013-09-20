define(
    [
        'require',
        'jquery',
        'stapes',
        'satnav',
        'modules/periodic-table'
    ],
    function(
        require,
        $,
        Stapes,
        Satnav,
        PeriodicTable
    ) {

        'use strict';

        /**
         * Page-level Mediator
         * @module Main
         * @implements {Stapes}
         */
        var Mediator = Stapes.subclass({

            /**
             * Mediator Constructor
             * @return {void}
             */
            constructor : function(){

                var self = this;
                self.initEvents();

                self.periodicTable = PeriodicTable({
                    el: '#periodic-table'
                });

                self.initRouter();

                $(function(){
                    self.emit('domready');
                });

            },

            /**
             * Initialize events
             * @return {void}
             */
            initEvents : function(){

                var self = this;
                self.on('domready', self.onDomReady);

            },

            /**
             * Initialize router
             * @return {void}
             */
            initRouter: function(){

                var self = this;

                // hashchange event handling
                Satnav({
                    html5: false, // don't use pushState
                    force: false, // force change event on same route
                    poll: 100 // poll hash every 100ms if polyfilled
                })
                .navigate({
                    path: 'mag',
                    directions: function(params) {
                        
                        require(['./mag'], function( mag ){
                            mag.init( self.periodicTable );
                        });
                    }
                })
                .otherwise('mag') // will route all unmatched paths to #/mag
                .change(function(params, old) {
                    
                })
                .go()
                ;
            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady : function(){

                var self = this;

            }

        });

        return new Mediator();
    }
);




