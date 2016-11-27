module.exports = function(grunt) {
    // 加载插件
    // 指定了要用哪些插件，全部放到数组中，并用forEach 循环遍历。
    [
        'grunt-cafe-mocha',
        'grunt-contrib-jshint',
        'grunt-exec',
        'grunt-contrib-less',
        'grunt-contrib-uglify',
        'grunt-contrib-cssmin',
        'grunt-hashres',
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
        //CSS预处理器全都支持变量, 从less/main.less 生成public/css/main.css
        less: {
            options: {
                customFunctions: {
                    static: function(lessObject, name) {
                        return 'url("' +
                            require('./lib/static.js').map(name.value) +
                            '")';
                    }
                }
            },
            development: {
                files: {
                    'public/css/main.css': 'less/main.less',
                    'public/css/cart.css': 'less/cart.less',
                }
            }
        },
        // uglify 任务（缩小经常被称为“丑化”是因为……好吧，只要看一下输出，你就明白了），
        // 我们把网址的所有JavaScript 拿到一起放到一个文件meadowlark.min.js 中
        uglify: {
            all: {
                files: {
                    'public/js/meadowlark.min.js': ['public/js/**/*.js']
                }
            }
        },
        //1. 首先把所有CSS 放到一个meadowlark.css 文件中
        //2. 然后我们缩小合并的CSS 到meadowlark.min.css
        cssmin: {
            combine: {
                files: {
                    'public/css/meadowlark.css': ['public/css/**/*.css',
                        '!public/css/meadowlark*.css'
                    ]
                }
            },
            minify: {
                src: 'public/css/meadowlark.css',
                dest: 'public/css/meadowlark.min.css',
            }
        },

        // 现在讲hashres 任务。我们想给这些打包和缩小的CSS 和JavaScript 文件添加指纹，
        // 以便在更新网站时可以马上看到这些变化，而不是要等到缓存的版本到期
        // hashres 会生成文件的哈希，重命名public/js/meadowlark.min.js 和public/css/meadowlark.min.css 文件
        // 自动修改views/layout/main.handlebars 中的引用
        hashres: {
            options: {
                fileNameFormat: '${name}.${hash}.${ext}'
            },
            all: {
                src: [
                    'public/js/meadowlark.min.js',
                    'public/css/meadowlark.min.css',
                ],
                dest: [
                    'views/layouts/main.handlebars',
                ]
            },
        }
    });
    // 注册任务
    grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
    grunt.registerTask('static', ['less', 'cssmin', 'uglify', 'hashres']);
};
