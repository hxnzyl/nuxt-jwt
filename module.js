const { resolve } = require('path')
const { defu } = require('defu')

const logger = consola.withScope('nuxt:jwt')

module.exports = function nuxtJwtModule(_moduleOptions) {
	const { nuxt } = this

	// Combine options
	const moduleOptions = {
		...nuxt.options.jwt,
		..._moduleOptions,
		...(nuxt.options.runtimeConfig && nuxt.options.runtimeConfig.jwt)
	}

	// Apply defaults
	const options = defu(moduleOptions, {
		loginUrl: process.env.JWT_LOGIN_URL || '/login',
		loginApi: process.env.JWT_LOGIN_API || '',
		logoutApi: process.env.JWT_LOGOUT_API || ''
	})

	// Add plugin
	this.addPlugin({
		src: resolve(__dirname, './plugin.js'),
		fileName: 'nuxt-jwt.js',
		options
	})

	logger.debug(`loginUrl: ${options.loginUrl}`)
	logger.debug(`loginApi: ${options.loginApi}`)
}

module.exports.meta = require('./package.json')
