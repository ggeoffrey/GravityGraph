module.exports = (grunt)->
  publicPath = './public'
  privatePath = './private'


  vendorsList = [
          "#{privatePath}/js/vendors/jquery-2.1.1.min.js"
          "#{privatePath}/js/vendors/angular.js"
          "#{privatePath}/js/vendors/angular-animate.js"
          "#{privatePath}/js/vendors/angular-resource.js"
          "#{privatePath}/js/vendors/angular-route.js"
          "#{privatePath}/js/vendors/bootstrap.js"
          "#{privatePath}/js/vendors/underscore.js"
          "#{privatePath}/js/vendors/spin.js"
        ]

  vendorsDest = "#{publicPath}/js/vendors.js"


  clientList = [
    "src/GravityGraph.ts"
  ]

  clientDest = "dist/GravityGraph.js"

  clientOptions =
    module: 'commonjs'
    target: 'es5'
    sourceMap: true
    declaration: true

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    uglify:
      options:
        banner: '/*! GravityGraph.min.js <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      prod:
        options:
          mangle : true
        files:
          './dist/<%= pkg.name %>.min.js': ['<%= concat.prod.dest %>']

    concat:
      options:
        separator: '\n'
      vendors:
        src: vendorsList
        dest: vendorsDest
      prod:
        src: [
          "#{publicPath}/js/vendors.js"
          "#{publicPath}/js/Mdrive.js"
        ]
        dest: "#{publicPath}/js/Mdrive.concat.js"


    clean:
      prebuild:
        src: [
          "dist/*"
        ]

    typescript:
      client:
        src: clientList
        dest: clientDest
        options: clientOptions

      clientTest:
        src: clientList.concat [
          "#{privatePath}/tests/*.ts"
        ]
        dest: clientDest
        options: clientOptions


    typedoc:
      build:
        options:
          module: 'commonjs'
          out: './doc'
          name: 'GravityGraph'
          target: 'es5'
          readme: 'readme.md'
        src: ['./src/**/*.ts']




  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  #grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-typescript'
  grunt.loadNpmTasks 'grunt-typedoc'

  grunt.registerTask 'doc', ['typedoc']

  grunt.registerTask 'dist', ['clean:prebuild', 'typescript:client', 'concat:vendors']

  grunt.registerTask 'default', ['dist']


