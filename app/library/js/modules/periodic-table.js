define(
    [
        'jquery',
        'stapes',
        'json!data/short-table.json',
        'tpl!templates/element.tpl'
    ],
    function(
        $,
        Stapes,
        shortTable,
        tplElement
    ) {

        'use strict';

        var defaults = {
            el: 'body',
            elementWidth: 70,
            elementHeight: 90
        };

        /**
         * Periodic table module
         * @module Main
         * @implements {Stapes}
         */
        var PeriodicTable = Stapes.subclass({

            /**
             * PeriodicTable Constructor
             * @return {void}
             */
            constructor : function( cfg ){

                var self = this;

                self.options = $.extend({}, defaults, cfg);
                self.ready = $.Deferred();
                self.nodes = {};

                self.initEvents();

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

                self.on('change', function( element ){
                    var data = self.get( element );

                    self.renderElement( element, data );
                });
            },

            renderElement: function( element, data ){

                var self = this
                    ,nodes = self.nodes
                    ,contents = self.contents
                    ,el
                    ;

                if (nodes[ element ]){
                    nodes[ element ].remove();
                }

                el = nodes[ element ] = $(tplElement.render( data )).appendTo( contents );
                el.css({
                    position: 'absolute',
                    left: data.col * self.options.elementWidth,
                    top: data.row * self.options.elementHeight
                });
            },

            setData: function( table ){

                var self = this
                    ,entry
                    ,data
                    ,contents = self.contents
                    ,rows = 0
                    ,cols = 0
                    ;

                contents.detach();

                for ( var i = 0; i < table.length; i++ ) {
                    
                    entry = table[ i ];
                    data = {
                        number: (i + 1),
                        symbol: entry[ 0 ],
                        name: entry[ 1 ],
                        mass: entry[ 2 ],
                        col: (entry[ 3 ] - 1),
                        row: (entry[ 4 ] - 1)
                    };

                    cols = Math.max( cols, entry[ 3 ] );
                    rows = Math.max( rows, entry[ 4 ] );

                    self.set( entry[ 0 ], data );
                }

                contents.css({
                    width: cols * self.options.elementWidth,
                    height: rows * self.options.elementHeight
                });
                self.el.append( contents );
            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady : function(){

                var self = this;

                self.el = $(self.options.el);
                self.contents = $('<div>').addClass('contents');
                
                self.setData( shortTable );

                this.ready.resolve();
            }
        });

        return function( cfg ){
            return new PeriodicTable( cfg );
        };
    }
);
