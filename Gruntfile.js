'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  'use strict';
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-mocha-test");
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      src: ["lib/**/*.js", "test/**/*.js"]
    },
    mochaTest: {
      test: {
        src: ['./lib/*-spec.js'],
        options: {
          reporters: 'Spec',
          logErrors: true,
          timeout: 1000,
          run: true
        }
      }
    }
  });
  grunt.registerTask('mocha',['mochaTest']);
  grunt.registerTask('test',['eslint','mocha']);
  grunt.registerTask('default', ['unit', 'mocha']);
  grunt.registerTask('default', ['eslint', 'mochaTest']);
};
