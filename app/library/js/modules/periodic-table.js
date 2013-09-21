define(
    [
        'jquery',
        'stapes',
        'lodash',
        'json!data/short-table.json',
        'json!data/long-table.json',
        'json!data/physical-properties.json',
        'tpl!templates/element.tpl'
    ],
    function(
        $,
        Stapes,
        _,
        shortTable,
        longTable,
        physicalProperties,
        tplElement
    ) {

        'use strict';


        var magneticResponders = _.omit(physicalProperties, function( props ){
            return !(props.mag.Tc || props.mag.Tn);
        });

        _.each(magneticResponders, function(val){
            if (val.mag.Tc && val.mag.Tn && val.mag.Tc >= val.mag.Tn){
                window.console.warn('Found Tc >= Tn for '+val.name, val);
            }
        });

        var defaults = {
            el: 'body',
            elementWidth: 70,
            elementHeight: 90,
            fontSize: 30,
            style: 'long'
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

                self.on('mutage:highlight', function( vals ){

                    self.el.removeClass( vals.oldValue ).addClass( vals.newValue );
                });
            },

            showMagneticResponse: function( temp ){

                var self = this
                    ,elem
                    ,mode
                    ,nodes = self.nodes
                    ;

                self.set('highlight', 'magnetic');

                // set overrides for temperature dependent magnetic response
                _.each(magneticResponders, function( elem, symbol ){

                    var $el = nodes[ symbol ];
                    
                    // antiferromagnetic below Tn
                    mode = ( elem.mag.Tn && temp <= elem.mag.Tn )? 'anti' : 'para';
                    // ferromagnetic below Tc
                    mode = ( elem.mag.Tc && temp <= elem.mag.Tc )? 'ferro' : mode;

                    $el.removeClass('anti para ferro dia').addClass( mode );
                });
            },

            setTableStyle: function( style ){

                var self = this;

                style = style && style.toLowerCase();

                if (style === 'long'){

                    self.setData( longTable );

                } else {

                    self.setData( shortTable );
                }
            },

            renderElement: function( element, data ){

                var self = this
                    ,nodes = self.nodes
                    ,contents = self.contents
                    ,el
                    ,fontSize = self.options.fontSize
                    ,toEm = function( px ){
                        return px / fontSize;
                    }
                    ;

                if (nodes[ element ]){

                    el = nodes[ element ].html( $(tplElement.render( data )).html() );

                } else {

                    el = nodes[ element ] = $(tplElement.render( data )).appendTo( contents );
                }

                if (window.Modernizr && window.Modernizr.csstransforms){

                    el.css({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        transform: 'translate(' + toEm(data.col * self.options.elementWidth) + 'em,' + toEm(data.row * self.options.elementHeight) + 'em)'
                    });

                } else {

                    el.css({
                        position: 'absolute',
                        left: toEm(data.col * self.options.elementWidth)+'em',
                        top: toEm(data.row * self.options.elementHeight)+'em'
                    });
                }
            },

            setData: function( table ){

                var self = this
                    ,entry
                    ,data
                    ,contents = self.contents
                    ,rows = 0
                    ,cols = 0
                    ;

                for ( var i = 0; i < table.length; i++ ) {
                    
                    entry = table[ i ];
                    data = $.extend({
                        number: (i + 1),
                        symbol: entry[ 0 ],
                        col: (entry[ 1 ] - 1),
                        row: (entry[ 2 ] - 1)
                    }, physicalProperties[ entry[0] ]);

                    cols = Math.max( cols, entry[ 1 ] );
                    rows = Math.max( rows, entry[ 2 ] );

                    self.set( entry[ 0 ], data );
                }

                contents.css({
                    width: cols * self.options.elementWidth,
                    height: rows * self.options.elementHeight
                });
            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady : function(){

                var self = this;

                self.el = $(self.options.el);
                self.contents = $('<div>').addClass('contents');

                self.setTableStyle( self.options.style );
                self.el.append( self.contents );

                this.ready.resolve();
            }
        });

        return function( cfg ){
            return new PeriodicTable( cfg );
        };
    }
);
