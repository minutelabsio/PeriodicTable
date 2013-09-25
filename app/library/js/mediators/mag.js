define(
    [
        'jquery'
    ],
    function(
        $
    ) {

        'use strict';

        function Logic( mediator, pt ){

            this.callback = $.proxy(pt.showMagneticResponse, pt);
            this.mediator = mediator;

            mediator.on({
                'change:temperature': this.callback
            });

            mediator.temperatureRange([0, 2000]);

            pt.showMagneticResponse( mediator.get('temperature') );
        }

        Logic.prototype = {
            cleanup: function(){

                this.mediator.off( 'change:temperature', this.callback );
            }
        };

        return function( mediator, pt ){
            return new Logic( mediator, pt );
        };
    }
);
