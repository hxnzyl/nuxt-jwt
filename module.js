const { resolve } = require('path')
const { defu } = require('defu')

module.exports = function nuxtJwtModule(moduleOptions = {}) {
	const { jwt = {} } = this.options

	//环境变量参数
	const options = defu(moduleOptions, jwt, {
		loginUrl: process.env.NUXT_JWT_LOGIN_URL || '/login',
		loginApi: process.env.NUXT_JWT_LOGIN_API || '',
		logoutApi: process.env.NUXT_JWT_LOGOUT_API || ''
	})

	// Add plugin
	this.addPlugin({
		src: resolve(__dirname, './plugin.js'),
		ssr: false,
		fileName: 'nuxt-jwt.js',
		options
	})
}

module.exports.meta = require('./package.json')
