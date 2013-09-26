define(
    [
        'require',
        'jquery',
        'stapes',
        'satnav',
        'popcorn',
        'modules/periodic-table',
        'json!data/periodic-videos.json',
        'nouislider'
    ],
    function(
        require,
        $,
        Stapes,
        Satnav,
        Popcorn,
        PeriodicTable,
        periodicVideos,
        _nouisl
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

        $.fn.selecter = function(){

            var sel = $('<nav class="selecter closed">')
                ,selected
                ,opts
                ,selTitle = this.find('option[selected], option').first().text()
                ,self = this
                ;

            selected = $('<span class="selecter-selected">'+ selTitle +'</span>');
            opts = $('<div class="selecter-options">').hide();
            sel.append( selected );
            sel.append( opts );

            this.find('option').each(function(){
                var el = $(this);
                var val = el.attr('value') || el.text();
                opts.append( '<a class="selecter-item" href="' + val + '">'+ el.text() +'</a>' );
            });

            this.on('change', function(){

                var val = $(this).val();
                var target;

                sel.find('.selected').removeClass('selected');
                target = sel.find('.selecter-item[href="'+ val +'"]').addClass('selected');
                selected.text( target.text() );
            });

            $(document).on('click', function(){
                opts.hide();
                sel.addClass('closed').removeClass('open');
            });

            sel.on('click', '.selecter-selected', function( e ){
                e.stopPropagation();
                opts.toggle();
                sel.toggleClass('closed open');
            });

            sel.on('click', '.selecter-item', function( e ){
                e.stopPropagation();
                self.val( $(this).attr('href') );
                opts.hide();
                sel.addClass('closed').removeClass('open');
            });

            this.after( sel );

            return this;
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
                
                self.periodicTable = PeriodicTable({
                    el: '#periodic-table'
                });

                self.set('units', 'K');

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

                $(document)
                    .on('click', '.ctrl-toggle-controls', function(){
                        self.viewport.toggleClass('reveal');
                        return false;
                    })
                    .on('click', '.ctrl-toggle-video', function(){
                        self.viewport.toggleClass('reveal-video');
                        return false;
                    })
                    .on('change', '.ctrl-theme', function(e, val){
                        $('body').toggleClass('light-skin', val === 'Light');
                    })
                    .on('change', '.ctrl-units', function(e, val){
                        self.set('units', val.toUpperCase());
                        self.emit('change:temperature', self.get('temperature'));
                    })
                    .on('change', '.ctrl-table-style', function(e, val){
                        self.periodicTable.setTableStyle( val );
                    })
                    .on('change', '.ctrl-table-size', function(e, val){
                        self.periodicTable.el.toggleClass( 'mini-table', val );
                    })
                    .on('change', '.ctrl-temperature', function(){
                        var $this = $(this)
                            ,temp = $this.val() | 0
                            ;
                        
                        self.set('temperature', temp);
                    })
                    .on('click', '.ctrl-play-video', function(e){

                        window.location.hash = '#';
                        self.loadVideo( $(this).attr('href'), true );
                        return false;
                    })
                    ;

                self.on('change:temperature', function( temp ){

                    var unit = self.get('units')
                        ,T = temp
                        ;

                    switch ( unit ){

                        case 'C':
                            T = (temp - 273) | 0;
                            T += '&deg;';
                        break;

                        case 'F':
                            T = (temp * 9/5 - 459.67) | 0;
                            T += '&deg;';
                        break;

                        // kelvin
                        default:
                        break;
                    }

                    if (self.temperatureSelector){
                        self.temperatureSelector
                            .find('.noUi-handle:first')
                            .html( T + unit )
                            ;
                    }
                });

                self.periodicTable.on('element', function( data ){

                    var vidId = periodicVideos[ data.number - 1 ];

                    if (vidId){

                        // load and play video
                        self.loadVideo('http://www.youtube.com/watch?v=' + vidId, true);
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
                            delete self.logic;
                        }

                        self.el.find('#about').hide();
                        self.el.find('#panels').show();
                        self.periodicTable.el.show();
                        
                        require(['./mag'], function( mag ){
                            self.logic = mag( self, self.periodicTable );
                        });
                    }
                })
                .navigate({
                    path: 'state',
                    directions: function(params) {

                        if (self.logic){
                            self.logic.cleanup();
                            delete self.logic;
                        }

                        self.el.find('#about').hide();
                        self.el.find('#panels').show();
                        self.periodicTable.el.show();
                        
                        require(['./state'], function( state ){
                            self.logic = state( self, self.periodicTable );
                        });
                    }
                })
                .navigate({
                    path: 'about',
                    directions: function(params) {

                        if (self.logic){
                            self.logic.cleanup();
                            delete self.logic;
                        }

                        self.periodicTable.el.hide();
                        self.el.find('#panels').hide();
                        self.el.find('#about').show();

                        require(['./dipole-visualization'], function( dipoles ){
                            self.logic = dipoles( self, '#about' );
                        });
                    }
                })
                .otherwise('mag') // will route all unmatched paths to #/mag
                .change(function(params, old) {
                    var hash = window.location.hash;
                    if ( hash && self.tableSelector.find( '[value="'+hash+'"]' ).length ){
                        self.tableSelector.val( hash ).trigger('change');
                    }
                })
                .go()
                ;

                $('#loading-msg').hide();
            },

            loadVideo: function( url, play ){

                var self = this;
                $('#original-video').remove();

                if ( typeof url === 'string' ){

                    if (url !== self.popcornUrl){
                       
                        if (self.popcorn){
                            self.popcorn.destroy();
                        }

                        self.popcorn = Popcorn.youtube( '#video-area', url );
                        self.popcornUrl = url;
                    }

                } else {

                    play = url;
                }

                if (play){

                    self.popcorn.play();
                    self.viewport.addClass('reveal-video');
                }
            },

            temperatureRange: function( range ){
                var self = this;
                var start = self.get( 'temperature' );
                start = Math.min(start, range[1]);

                self.temperatureSelector = $('.ctrl-temperature').empty().noUiSlider({
                    handles: 1,
                    range: range,
                    start: [start],
                    slide: function(){
                        $(this).trigger('change');
                    }
                });

                self.emit('change:temperature', start);
            },

            /**
             * DomReady Callback
             * @return {void}
             */
            onDomReady : function(){

                var self = this;
                self.viewport = $('#viewport');
                self.el = $('#main');
                self.controls = $('#controls');

                self.set('temperature', 273);

                $('.toggler').toggler();
                $('.selecter.fake').remove();
                self.tableSelector = $('.ctrl-table-switcher:first').selecter();

                self.initRouter();

                setTimeout(function(){
                    // reveal video after 1.5 seconds
                    self.viewport.addClass('reveal-video');
                }, 1500);
            }

        });

        return new Mediator();
    }
);




