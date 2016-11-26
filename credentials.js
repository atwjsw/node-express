module.exports = {
    cookieSecret: ' 把你的cookie 秘钥放在这里',
    gmail: {
        user: 'your gmail username',
        password: 'your gmail password',
    },
    mongo: {
        development: {
            connectionString: 'mongodb://localhost/meadowlark',
        },
        production: {
            connectionString: 'mongodb://localhost/meadowlark',
        },
        connectionString: 'mongodb://localhost/meadowlark',
    },
};
