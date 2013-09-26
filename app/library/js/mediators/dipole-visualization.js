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
            this.el = $(el).find('#dipole-visualization');
            this.elLegend = $(el).find('#legend-visualization');
            var Tmin = 0;
            var Tmax = 400;
            var start = 273;

            self.materials = $([]);
            self.materialLegend = $([]);

            this.mediator = mediator;
            mediator.temperatureRange([0, 0]);

            this.animate = $.Callbacks();
            this.animateLegend = $.Callbacks();

            // materials
            self.tempCtrl = $('<div>').addClass('temp-slider').noUiSlider({
                handles: 1,
                range: [Tmin, Tmax],
                start: [start],
                slide: function(){
                    var $this = $(this);
                    var val = $this.val();
                    self.materials.data('temp', val);
                    $this.find('.noUi-handle').text( (val|0) + 'K' );
                }
            });

            self.tempCtrl.find('.noUi-handle').text( start + 'K' );

            self.materials = this.createMaterial({
                    title: 'Dysprosium (Dy)',
                    Tc: 92.1,
                    Tn: 180.2,
                    Tmax: Tmax,
                    Tmin: Tmin,
                    callback: self.animate
                }).add(
                    this.createMaterial({
                        title: 'Gadolinium (Gd)',
                        Tc: 291.8,
                        Tmax: Tmax,
                        Tmin: Tmin,
                        callback: self.animate
                    })
                ).data('temp', start)
                ;

            this.el.empty()
                .append( self.materials )
                .append( self.tempCtrl );

            self.tempCtrl.trigger('change');

            // legend
            self.tempCtrlLegend = $('<div>').addClass('temp-slider').noUiSlider({
                handles: 1,
                range: [0, 100],
                start: [20],
                slide: function(){
                    var $this = $(this);
                    var val = $this.val();
                    self.materialLegend.data('temp', val);
                    $this.find('.noUi-handle').text( (val|0) + 'K' );
                }
            });

            self.tempCtrlLegend.find('.noUi-handle').text( '20K' );

            self.materialLegend = this.createMaterial({
                Tc: 33,
                Tn: 66,
                Tmax: 100,
                Tmin: 0,
                callback: self.animateLegend
            }).data('temp', 20);

            this.elLegend.empty()
                .append( self.materialLegend )
                .append( self.tempCtrlLegend );

            self.tempCtrlLegend.trigger('change');

            // animation loops
            function anim(){
                var temp = self.materials.data('temp')|0;
                var T = (temp-Tmin)/(Tmax-Tmin);
                var time = 300 * (4 - T * 3)/4 | 0;
                self.animate.fire( time );
                self.to = setTimeout(anim, time);
            }
            
            anim();

            function animLegend(){
                var temp = self.materialLegend.data('temp')|0;
                var T = (temp-Tmin)/(Tmax-Tmin);
                var time = 300 * (4 - T * 3)/4 | 0;
                self.animateLegend.fire( time );
                self.toLegend = setTimeout(animLegend, time);
            }
            
            animLegend();
        }

        Logic.prototype = {

            createMaterial: function( cfg ){

                var self = this
                    ,$material = $('<div>').addClass('material').attr('data-title', cfg.title)
                    ,$dipole = $('<div>').addClass('dipole')
                    ,tf = window.Modernizr.prefixed('transform')
                    ,ts = window.Modernizr.prefixed('transition')
                    ;

                for (var i = 0; i < 28; i++){
                    $dipole.clone().appendTo( $material );
                }

                var $dipoles = $material.find('.dipole');

                function getTransform(el, index, ferro, anti, T){

                    var offset = 0;
                    var rot;
                    var $this = $(el);

                    if (ferro){

                        rot = T * (Math.random() - 0.5) * Math.PI;

                    } else if (anti){

                        rot = (index % 2) * Math.PI + (T * (Math.random() - 0.5) * Math.PI);

                    } else {
                        rot = $this.data('rot')||0;
                        rot += T * (Math.random()-0.5) * Math.PI * 2;
                        rot -= (rot > Math.PI)? Math.PI : 0;
                        rot += (rot < -Math.PI)? Math.PI : 0;
                        $this.data('rot', rot);
                    }

                    return 'rotate(' + rot + 'rad) translate('+ (T * (Math.random()-0.5) * 6) +'px, ' + (T * (Math.random()-0.5) * 6) +'px) translateZ(0)';
                }

                function fluctuate( time ){

                    var temp = $material.data('temp') | 0;
                    var anti = cfg.Tn && (temp < cfg.Tn);
                    var ferro = cfg.Tc && (temp < cfg.Tc);
                    var T = (temp-cfg.Tmin)/(cfg.Tmax-cfg.Tmin);
                    var classes = 'material ' + (anti && !ferro ? 'anti' : ferro ? 'ferro' : '');
                    var el;
                    
                    if ($material[0].className !== classes){
                        $material[0].className = classes;
                    }

                    for ( var i = 0, l = $dipoles.length; i < l; ++i ){
                        
                        el = $dipoles[ i ];
                        el.style[ tf ] = getTransform(el, i, ferro, anti, T);
                        el.style[ ts + 'Duration' ] = time + 'ms';
                    }
                }

                cfg.callback.add(fluctuate);
                return $material;
            },

            cleanup: function(){
                var self = this;
                clearTimeout( self.to );
                clearTimeout( self.toLegend );
            }
        };

        return function( mediator, el, cfg ){
            return new Logic( mediator, el, cfg );
        };
    }
);
