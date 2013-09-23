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

        $.fn.toggler = function(){
            return this.each(function(){

                var $root = $(this)
                    ,$selected = $root.find('.on:first') || $root.find('button:first')
                    ;

                $root.data('value', $selected.data('value') || $selected.text());

                $root.on('click', 'button:not(.on)', function(){
                    var $this = $(this);
                    $root.find('button').removeClass('on');
                    $this.addClass('on');
                    $root.data('value', $this.data('value') || $this.text());
                    $root.trigger('change', $root.data('value'));
                    return false;
                });
            });
        };

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

                $(document)
                    .on('click', '.ctrl-toggle-sidebar', function(){

                        self.el.toggleClass('reveal');
                        return false;
                    })
                    .on('click', '.ctrl-toggle-video', function(){

                        self.el.toggleClass('reveal-video');
                        return false;
                    })
                    .on('change', '.ctrl-table-style', function(e, val){
                        self.periodicTable.setTableStyle( val );
                    })
                    .on('change', '.ctrl-table-size', function(e, val){
                        self.periodicTable.el.toggleClass( 'mini-table', val );
                    })
                    .on('change', '.ctrl-temperature', function(){

                        var temp = $(this).val();

                        self.set('temperature', temp);
                    })
                    ;

                self.on({
                    'change:temperature': function( T ){
                        self.controls.find('.temperature-display').text( T );
                    }
                });
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

                        if (self.logic){
                            self.logic.cleanup();
                        }
                        
                        require(['./mag'], function( mag ){
                            self.logic = mag( self, self.periodicTable );
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
                self.el = $('#main');
                self.controls = $('#sidebar');

                self.set('temperature', self.controls.find('.ctrl-temperature').val());
                self.initRouter();

                $('.toggler').toggler();
            }

        });

        return new Mediator();
    }
);




