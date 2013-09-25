define(
    [
        'jquery'
    ],
    function(
        $
    ) {

        'use strict';

        function Logic( mediator, pt ){

            this.callback = $.proxy(pt.showStates, pt);
            this.mediator = mediator;

            mediator.on({
                'change:temperature': this.callback
            });

            mediator.temperatureRange([0, 6000]);

            pt.showStates( mediator.get('temperature') );
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
