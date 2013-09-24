/**
 * Config options at: http://requirejs.org/docs/api.html#config
 */
require.config({
    
    shim: {
        // Add shims for things here
    },

    paths: {
        //
        //  This is where you can add paths to any plugins or vendor scripts.
        //
        'satnav': 'vendor/satnav',

        // Plugins
        'text': 'plugins/text',
        'json': 'plugins/json',
        'tpl' : 'plugins/tpl',
        'async' : 'plugins/async',

        // Templating
        'dot' : 'vendor/doT',

        // MVC
        'stapes': 'vendor/stapes',
        
        // jQuery
        'jquery': 'vendor/jquery',
        'nouislider': 'vendor/jquery.nouislider.min',

        // lodash
        'lodash': 'vendor/lodash'
    },

    map: {
        
        '*' : {
            'jquery': 'modules/adapters/jquery', // jQuery noconflict adapter
            'site-config': 'config/site-config.json'
        },

        'modules/adapters/jquery': {
            'jquery': 'jquery'
        }
    }
});
