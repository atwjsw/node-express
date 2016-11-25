module.exports = function(grunt) {
    // 加载插件
    // 指定了要用哪些插件，全部放到数组中，并用forEach 循环遍历。
    [
        'grunt-cafe-mocha',
        'grunt-contrib-jshint',
        'grunt-exec',
    ].forEach(function(task) {
        grunt.loadNpmTasks(task);
    });
    // 配置插件
    grunt.initConfig({
    	//测试文件在哪里。我们把所有测试都放在子目录qa 下面，并在文件名中加上前缀tests-。指定TDD 界面。
        cafemocha: {
            all: { src: 'qa/tests-*.js', options: { ui: 'tdd' }, }
        },
        //指定要对哪些JavaScript 文件去毛
        jshint: {
            app: ['meadowlark.js', 'public/js/**/*.js',
                'lib/**/*.js'
            ],
            qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
        },
        exec: {
            linkchecker: { cmd: 'linkchecker http://localhost:3000' }
        },
    });
    // 注册任务
    grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
};
