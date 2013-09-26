define(
    [
        'jquery'
    ],
    function(
        $
    ) {

        'use strict';

        function Logic( mediator, el, cfg ){

            this.el = $(el);
            this.mediator = mediator;
            cfg = cfg || {};
            this.Tc = cfg.Tc || 333;
            this.Tn = cfg.Tn || 666;
            this.Tmax = cfg.Tmax || 1000;

            this.tempChanged = $.proxy(this.tempChanged, this);

            mediator.on({
                'change:temperature': this.tempChanged
            });

            mediator.temperatureRange([0, this.Tmax]);
            this.temp = mediator.get('temperature');

            this.createMaterial();
            this.el.empty().append( this.material );
        }

        Logic.prototype = {

            createMaterial: function(){

                var self = this
                    ,$material = $('<div>').addClass('material')
                    ,$dipole = $('<div>').addClass('dipole')
                    ;

                for (var i = 0; i < 28; i++){
                    $dipole.clone().appendTo( $material );
                }

                var $dipoles = $material.find('.dipole');

                function fluctuate(){
                    
                    var anti = self.Tn && (self.temp < self.Tn);
                    var ferro = self.Tc && (self.temp < self.Tc);
                    var T = self.temp/self.Tmax;
                    var time = 300 * (4 - T * 3)/4 | 0;
                    $material.toggleClass('ferro', ferro).toggleClass('anti', anti && !ferro);

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
                    
                    clearTimeout( self.to );
                    self.to = setTimeout(fluctuate, time);
                }

                self.material = $material;
                fluctuate();
            },

            tempChanged: function( t ){

                this.temp = t;
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
