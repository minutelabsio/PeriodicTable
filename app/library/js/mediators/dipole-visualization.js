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
                    var T = (ferro && (self.temp / self.Tc)) || (anti && ((self.temp - self.Tc || 0) / (self.Tn - self.Tc || 0) ));
                    $material.toggleClass('ferro', ferro).toggleClass('anti', anti && !ferro);

                    $dipoles.css('transform', function(){

                        var offset = 0;
                        var rot;

                        if (ferro){

                            rot = T * (Math.random() - 0.5) * Math.PI;

                        } else if (anti){

                            rot = ($(this).index() % 2) * Math.PI + (T * (Math.random() - 0.5) * Math.PI);

                        } else {

                            rot = Math.random() * Math.PI * 2;
                        }

                        return 'rotate(' + rot + 'rad)';
                    });
                    
                    clearTimeout( self.to );
                    self.to = setTimeout(fluctuate, 300);
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
