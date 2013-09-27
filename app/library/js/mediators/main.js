define(
    [
        'require',
        'jquery',
        'stapes',
        'satnav',
        'popcorn',
        'lodash',
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
        _,
        PeriodicTable,
        periodicVideos,
        _nouisl
    ) {

        'use strict';

        var videoUrl = 'http://www.youtube.com/watch?v=qlA7_78Zqrk';
        var magneticElements = 'Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Th Pa U Np Pu Am Cm Bk Cf Es Fm Md Cr Mn Fe Co Ni Mo Tc Ru Rh Pd W Re Os Ir Pt';

        function lerp(a, b, p) {
            return (b-a)*p + a;
        }

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
                    .on('click', '.ctrl-toggle-legend', function(){
                        self.viewport.toggleClass('reveal-legend');
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
                    .on('click', '.ctrl-play-video', function(e){

                        self.initVideoOrchestration();
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
                .navigate({
                    path: 'autoplay',
                    directions: function(params) {

                        window.location.hash = '#mag';
                        window.setTimeout($.proxy(self.initVideoOrchestration, self), 1000);
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

            initVideoOrchestration: function(){

                var self = this
                    ,pop
                    ;

                self.loadVideo( videoUrl, true );
                pop = self.popcorn;

                pop.on('playing', function(){
                    
                    self.periodicTable.mouseevents = false;
                    if ( pop.roundTime() > 23 ){
                        self.periodicTable.setState('highlight magnetic');
                    } else {
                        self.periodicTable.setState('highlight');
                    }

                }).on('pause', function(){

                    self.periodicTable.mouseevents = true;
                    self.periodicTable.highlight( false ).setState('magnetic');

                }).on('ended', function(){

                    self.periodicTable.mouseevents = true;
                    self.periodicTable.highlight( false ).setState('magnetic');
                });

                pop.code({
                    start: 0,
                    onStart: function(){

                        self.viewport.addClass('reveal-legend').removeClass('reveal');
                        self.periodicTable.el.addClass( 'mini-table' );
                        self.periodicTable.mouseevents = false;
                    },
                    onEnd: function(){
                        self.periodicTable.mouseevents = true;
                    }
                }).code({
                    start: 0,
                    end: 40,
                    onStart: function(){
                        self.temperatureSelector.val( 273 );
                        self.set('temperature', 273);
                        self.periodicTable.setState('highlight');
                    }
                }).code({
                    start: 1,
                    end: 7,
                    onStart: function(){
                        var pt = self.periodicTable.highlight( false )
                            ,els = 'Nd Fe B'.split(' ')
                            ;

                        for ( var i = 0, l = els.length; i < l; ++i ){
                            
                            setTimeout(
                                $.proxy( pt.highlight, pt, els[ i ], true ),
                                i * 600
                            );
                        }
                    },
                    onEnd: function(){
                        self.periodicTable
                            .highlight(false)
                            ;
                    }
                }).code({
                    start: 13,
                    end: 18,
                    onStart: function(){
                        var pt = self.periodicTable;

                        pt.highlight(false).highlight( magneticElements );
                    },
                    onEnd: function(){
                        self.periodicTable
                            .highlight(false)
                            ;
                    }
                }).code({
                    start: 22.5,
                    onStart: function(){
                        self.periodicTable.setState('highlight magnetic');
                    }
                }).code({
                    start: 22.5,
                    end: 24,
                    onStart: function(){
                        var pt = self.periodicTable;

                        pt.highlight(false).highlight( 'Co Ni Gd Fe', true );
                    }
                }).code({
                    start: 24,
                    end: 26,
                    onStart: function(){
                        var pt = self.periodicTable;

                        pt.highlight( false ).highlight( 'Fe', true );
                    },
                    onEnd: function(){
                        self.periodicTable
                            .highlight(false)
                            ;
                    }
                }).code({
                    start: 33,
                    end: 35,
                    onStart: function(){
                        var pt = self.periodicTable;

                        pt.highlight( false ).highlight( 'Cr', true );
                    }
                }).code({
                    start: 40,
                    end: 41.5,
                    onStart: function(){
                        var pt = self.periodicTable;

                        self.temperatureSelector.val( 140 );
                        self.set('temperature', 140);

                        pt.highlight( false ).highlight( 'Gd', true );
                    },
                    onEnd: function(){
                        self.periodicTable
                            .highlight( 'Dy', true )
                            ;
                    }
                }).code({
                    start: 42,
                    end: 46,
                    onStart: function( options ){
                        
                        options.anim = $('<div>').css('opacity', 0).animate({
                            opacity: 1
                        }, {
                            duration: ( options.end - options.start ) * 1000,
                            step: function( t ){
                                var temp = lerp(140, 300, t) | 0;
                                self.temperatureSelector.val( temp );
                                self.set('temperature', temp);
                            }
                        });
                        
                    },
                    onEnd: function( options ){
                        if (options.anim){
                            options.anim.stop();
                        }
                    }
                }).code({
                    start: 46,
                    end: 52,
                    onEnd: function(){
                        self.periodicTable
                            .highlight( false )
                            ;
                    }
                }).code({
                    start: 60,
                    end: 66,
                    onStart: function(){
                        var pt = self.periodicTable;

                        self.temperatureSelector.val( 273 );
                        self.set('temperature', 273);

                        pt.highlight( false ).highlight( 'O', true );
                    },
                    onEnd: function(){
                        self.periodicTable
                            .highlight( false )
                            ;
                    }
                }).code({
                    start: 70,
                    end: 80,
                    onStart: function( options ){
                        var pt = self.periodicTable;

                        self.temperatureSelector.val( 273 );
                        self.set('temperature', 273);

                        pt.highlight( false ).highlight( 'Co Ni Fe', true );

                        options.anim = $('<div>').css('opacity', 0).animate({
                            opacity: 1
                        }, {
                            duration: ( options.end - options.start ) * 1000,
                            step: function( t ){
                                var temp = lerp(600, 1400, t) | 0;
                                self.temperatureSelector.val( temp );
                                self.set('temperature', temp);
                            }
                        });
                    },
                    onEnd: function( options ){

                        self.periodicTable
                            .highlight( false )
                            ;

                        if (options.anim){
                            options.anim.stop();
                        }
                    }
                }).code({
                    start: 95,
                    end: 100,
                    onStart: function( options ){
                        var pt = self.periodicTable;

                        self.temperatureSelector.val( 10 );
                        self.set('temperature', 10);

                        window.location.hash = '#state';
                        
                        pt.highlight( false );

                        options.anim = $('<div>').css('opacity', 0).animate({
                            opacity: 1
                        }, {
                            duration: ( options.end - options.start ) * 1000,
                            step: function( t ){
                                var temp = lerp(10, 4000, t) | 0;
                                self.temperatureSelector.val( temp );
                                self.set('temperature', temp);
                            }
                        });
                    },
                    onEnd: function( options ){

                        self.periodicTable
                            .highlight( false )
                            ;

                        if (options.anim){
                            options.anim.stop();
                        }
                    }
                }).code({
                    start: 100,
                    end: 105,
                    onStart: function( options ){
                        var pt = self.periodicTable;

                        self.temperatureSelector.val( 10 );
                        self.set('temperature', 10);

                        window.location.hash = '#mag';
                        
                        pt.highlight( false );

                        options.anim = $('<div>').css('opacity', 0).animate({
                            opacity: 1
                        }, {
                            duration: ( options.end - options.start ) * 1000,
                            step: function( t ){
                                var temp = lerp(2, 1400, t) | 0;
                                self.temperatureSelector.val( temp );
                                self.set('temperature', temp);
                            }
                        });
                    },
                    onEnd: function( options ){

                        self.periodicTable
                            .highlight( false )
                            ;

                        if (options.anim){
                            options.anim.stop();
                        }
                    }
                });
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
                    slide: _.throttle(function(){
                        var $this = $(this)
                            ,temp = $this.val() | 0
                            ;
                        
                        self.set('temperature', temp);
                    }, 40)
                });

                self.emit('change:temperature', start);
            },

            setLegend: function( html ){
                
                this.el.find('#legend-area').html( html );
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




