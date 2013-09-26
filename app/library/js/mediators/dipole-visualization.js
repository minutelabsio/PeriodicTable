define(
    [
        'jquery',
        'nouislider'
    ],
    function(
        $,
        _nouisl
    ) {

        'use strict';

        function Logic( mediator, el ){

            var self = this;
            this.el = $(el);
            var Tmin = 0;
            var Tmax = 400;
            var start = 273;

            this.mediator = mediator;
            mediator.temperatureRange([0, 0]);

            self.tempCtrl = $('<div>').addClass('temp-slider').noUiSlider({
                handles: 1,
                range: [Tmin, Tmax],
                start: [start],
                slide: function(){
                    var $this = $(this);
                    var val = $this.val();
                    self.tempChanged( val );
                }
            });

            self.tempChanged( start );

            this.animate = $.Callbacks();

            this.el.empty().append( this.createMaterial({
                title: 'Dysprosium (Dy)',
                Tc: 92.1,
                Tn: 180.2,
                Tmax: Tmax,
                Tmin: Tmin
            })).append( this.createMaterial({
                title: 'Gadolinium (Gd)',
                Tc: 291.8,
                Tmax: Tmax,
                Tmin: Tmin
            })).append( self.tempCtrl );

            function anim(){
                var T = (self.temp-Tmin)/(Tmax-Tmin);
                var time = 300 * (4 - T * 3)/4 | 0;
                self.animate.fire( time );
                self.to = setTimeout(anim, time);
            }
            
            anim();
        }

        Logic.prototype = {

            createMaterial: function( cfg ){

                var self = this
                    ,$material = $('<div>').addClass('material').attr('data-title', cfg.title)
                    ,$dipole = $('<div>').addClass('dipole')
                    ;

                for (var i = 0; i < 28; i++){
                    $dipole.clone().appendTo( $material );
                }

                var $dipoles = $material.find('.dipole');

                function fluctuate( time ){
                    
                    var anti = cfg.Tn && (self.temp < cfg.Tn);
                    var ferro = cfg.Tc && (self.temp < cfg.Tc);
                    var T = (self.temp-cfg.Tmin)/(cfg.Tmax-cfg.Tmin);
                    
                    $material.toggleClass('ferro', ferro).toggleClass('anti', !!anti && !ferro);

                    $dipoles.css('transform', function(){

                        var offset = 0;
                        var rot;
                        var $this = $(this);

                        if (ferro){

                            rot = T * (Math.random() - 0.5) * Math.PI;

                        } else if (anti){

                            rot = ($this.index() % 2) * Math.PI + (T * (Math.random() - 0.5) * Math.PI);

                        } else {
                            rot = $this.data('rot')||0;
                            rot += T * (Math.random()-0.5) * Math.PI * 2;
                            rot -= (rot > Math.PI)? Math.PI : 0;
                            rot += (rot < -Math.PI)? Math.PI : 0;
                            $this.data('rot', rot);
                        }

                        return 'rotate(' + rot + 'rad) translate('+ (T * (Math.random()-0.5) * 6) +'px, ' + (T * (Math.random()-0.5) * 6) +'px)';
                    }).css('transition-duration', time+'ms');
                }

                self.animate.add(fluctuate);
                return $material;
            },

            tempChanged: function( t ){

                this.temp = t;
                this.tempCtrl.find('.noUi-handle').text( (t|0) + 'K' );
            },

            cleanup: function(){

                clearTimeout( self.to );
                this.mediator.off( 'change:temperature', this.tempChanged );
            }
        };

        return function( mediator, el, cfg ){
            return new Logic( mediator, el, cfg );
        };
    }
);
