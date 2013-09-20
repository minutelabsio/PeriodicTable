/**
 * Grunt build file
 * @author Jasper Palfree
 */

'use strict';

module.exports = function(grunt) {

    var path = require('path');
    var prompt = require('prompt');
    var pkg, config;

    pkg = grunt.file.readJSON('package.json');

    config = {
        banner : [
            '/**\n',
            ' * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n',
            ' * <%= pkg.description %>\n',
            ' *\n',
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n',
            ' * Licensed <%= pkg.license %>\n',
            ' */\n'
        ].join(''),

        sourceDir: 'app',
        compressedDir: 'dist',
        utils: '', // Any utils can go here 

        pkg : pkg
    };

    // Project configuration.
    grunt.initConfig({
        pkg: config.pkg,
        config: config,

        jshint : {
            options : {
                jshintrc : 'jshint.json'
            },
            source: [
                '<%= config.sourceDir %>/library/js/{.,modules,mediators}/*.js'
            ]
        },
        bgShell: {
            _defaults: {
                bg: false
            },

            watchCompass: {
                cmd: 'compass watch',
                bg: true
            },

            httpserver: {
                cmd: 'node node_modules/http-server/bin/http-server -p 8080 <%= config.sourceDir %>',
                bg: false
            },

            cleanCompass: {
                cmd: 'compass clean --config <%= compass.dist.options.config %>',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true
                }
            },
        },
        clean: [
            '<%= config.compressedDir %>'
        ],
        compass: {
            dist: {
                options: {
                    config: 'config.rb',
                    force: true
                }
            }
        },
        img: {
            app: {
                src: '<%= config.compressedDir %>/library'
            }
        },
        // r.js optimization task
        requirejs: {
            app: {
                options: require('./build/require-build')
            }
        }
    });

    function promptVersion(){
        var ver = pkg.version;
        var properties = [
            {
                message: 'Enter the version (defaults to last)',
                name: 'version', 
                validator: /^[0-9]+\.[0-9]+\.[0-9]+$/,
                default: ver,
                warning: 'Version must take the form #.#.#'
            }
        ];

        var done = this.async();

        prompt.start();
        prompt.get(properties, function (err, result) {
            if (err) { return done(err); }
            console.log('Setting version to: ' + result.version);
            pkg.version = result.version;
            grunt.file.write('package.json', JSON.stringify( pkg, null, 4 ));
            done();
        });
    }

    // Load plugins
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-img');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-compass');
    
    // Tasks
    grunt.registerTask('version', promptVersion);
    grunt.registerTask('compress-only', ['compass', 'requirejs:app'])

    // Primary tasks
    grunt.registerTask('cleanup', ['clean', 'bgShell:cleanCompass']);
    grunt.registerTask('dev', [ 'bgShell:watchCompass', 'bgShell:httpserver' ]);
    grunt.registerTask('build', ['cleanup', 'version', 'jshint:source', 'compress-only', 'img:app']);
    
    // Default task(s).
    grunt.registerTask('default', ['build']);

};
