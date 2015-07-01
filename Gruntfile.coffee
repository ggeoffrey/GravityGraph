module.exports = (grunt)->
  publicPath = './public'
  privatePath = './private'


  vendorsList = [
          "vendors/d3.min.js",
          "vendors/d3.layout.force3D.js",
          "vendors/three.js",
          "vendors/CanvasRenderer.js",
          "vendors/Detector.js",
          "vendors/OrbitControls.js",
          "vendors/Projector.js",
          "vendors/stats.min.js",
          "vendors/tweenjs-0.6.0.min.js",
          "vendors/droid_sans_regular.typeface.js",
          "vendors/underscore-min.js",
        ]

  vendorsDest = "dist/vendors.js"


  clientList = 'src/**/*.ts' 
  ###
  [
    "GravityGraph.ts"
    "Utils.ts"
    "worker.ts"    
  ]
  ###

  clientDest = "dist/GravityGraph.js"


  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    typescript:
      dev:
        src: clientList
        dest: clientDest
        options:
          basePath : 'src'
          module: 'commonjs'
          target: 'es5'
          sourceMap: true
          declaration: true
      watch:
        src: clientList
        dest: clientDest
        options: 
          basePath : 'src'
          module: 'commonjs'
          target: 'es5'
          sourceMap: true
          declaration: true
          watch:
            atBegin: true


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
        separator: '\n;\n'
      vendors:
        src: vendorsList
        dest: vendorsDest
      prod:
        src: [
          "dist/vendors.js"
          "dist/GravityGraph.js"
        ]
        dest: "dist/GravityGraph.min.js"


    clean:
      prebuild:
        src: [
          "dist/*"
        ]



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

  grunt.registerTask 'prod', ['preprod', 'uglify:prod']
  grunt.registerTask 'preprod', ['clean:prebuild', 'typescript:dev', 'concat:vendors', 'concat:prod']

  grunt.registerTask 'doc', ['typedoc']


  grunt.registerTask 'dist', ['clean:prebuild', 'typescript:dev', 'concat:vendors']
  
  grunt.registerTask 'ts', ['typescript:dev']
  grunt.registerTask 'watch', ['typescript:watch']

  
  grunt.registerTask 'default', ['dist']


