const { resolve } = require('path')
const { defu } = require('defu')

const meta = require('./package.json')

module.exports = function nuxtJwtModule(_moduleOptions) {
	const { runtimeConfig, jwt = {} } = this.options

	// Combine options
	const moduleOptions = {
		...jwt,
		..._moduleOptions,
		...(runtimeConfig && runtimeConfig.jwt)
	}

	// Apply defaults
	const options = defu(moduleOptions, {
		//登录地址，必填
		loginUrl: process.env.JWT_LOGIN_URL || '/login',
		//未登录时重定向地址，必填
		noLoginRedirect: process.env.JWT_NO_LOGIN_REDIRECT || '/',
		//未登录时后端接口返回的状态，必填
		noLoginHttpStatus: process.env.JWT_NO_LOGIN_HTTP_STATUS || 401,
		//登录接口地址，选填
		loginApi: process.env.JWT_LOGIN_API || '',
		//登出接口地址，选填
		logoutApi: process.env.JWT_LOGOUT_API || ''
	})

	// Add plugin
	this.addPlugin({
		src: resolve(__dirname, './plugin.js'),
		fileName: 'nuxt-jwt.js',
		options
	})

	consola.info(meta.name + ': v' + meta.version)
}

module.exports.meta = meta
