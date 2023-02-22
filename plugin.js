const state = {
	accessToken: '',
	refreshToken: '',
	userData: null
}

const mutations = {
	SET_ACCESS_TOKEN(state, accessToken) {
		state.accessToken = accessToken
	},
	SET_REFRESH_TOKEN(state, refreshToken) {
		state.refreshToken = refreshToken
	},
	SET_USER_DATA(state, userData) {
		state.userData = userData
	}
}

const actions = {
	/**
	 * 客户端页面渲染前的store处理
	 * ssr:false
	 */
	nuxtClientInit({ commit }) {
		commit('SET_ACCESS_TOKEN', localStorage.getItem('accessToken') || '')
		commit('SET_REFRESH_TOKEN', localStorage.getItem('refreshToken') || '')
		console.log(localStorage.getItem('userData'))
		commit('SET_USER_DATA', JSON.parse(localStorage.getItem('userData')) || null)
	},
	/**
	 * 更新用户信息
	 *
	 * @param {Vuex.Store} param0
	 * @param {Object}
	 */
	updateUserData({ commit }, userData) {
		commit('SET_USER_DATA', { ...userData })
		localStorage.setItem('userData', JSON.stringify(userData))
	},
	/**
	 * 更新登录数据
	 *
	 * @param {Vuex.Store} param0
	 * @param {Object}
	 */
	updateLoginData({ commit }, { accessToken, refreshToken, userData }) {
		commit('SET_ACCESS_TOKEN', accessToken)
		commit('SET_REFRESH_TOKEN', refreshToken)
		commit('SET_USER_DATA', { ...userData })
		localStorage.setItem('accessToken', accessToken)
		localStorage.setItem('refreshToken', refreshToken)
		localStorage.setItem('userData', JSON.stringify(userData))
	},
	/**
	 * 清空登录数据
	 *
	 * @param {Vuex.Store} param0
	 * @param {Object}
	 */
	clearLoginData({ commit }) {
		commit('SET_ACCESS_TOKEN', '')
		commit('SET_REFRESH_TOKEN', '')
		commit('SET_USER_DATA', null)
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		localStorage.removeItem('userData')
	},
	/**
	 * 登录
	 *
	 * @param {Vuex.Store} param0
	 * @param {Object} param1
	 * @returns {Promise}
	 */
	login({ dispatch }, _data) {
		// <% if (options.loginApi) { %>
		let { data, redirect, checkData } = _data
		return new Promise((resolve) => {
			this.$axios
				.post('<%= options.loginApi %>', data)
				.then((res) => {
					let checkResult = checkData ? checkData(res.data) : res.data
					if (checkResult && checkResult.accessToken)
						dispatch('updateLoginData', checkResult),
							redirect && $nuxt.$router.push(decodeURIComponent(redirect)),
							resolve([true, checkResult])
					else resolve([false, checkResult])
				})
				.catch((error) => resolve([false, error]))
		})
		// <% } %>
		// <% if (!options.loginApi) { %>
		return dispatch('updateLoginData', _data)
		// <% } %>
	},
	/**
	 * 登出
	 *
	 * @param {Vuex.Store} param0
	 * @returns {Promise}
	 */
	logout({ dispatch }, data) {
		// <% if (options.logoutApi) { %>
		return new Promise((resolve, reject) => {
			this.$axios
				.post('<%= options.logoutApi %>', data)
				.then((res) => (dispatch('clearLoginData'), resolve([true, res.data])))
				.catch((error) => reject([false, error]))
		})
		// <% } %>
		// <% if (!options.logoutApi) { %>
		return dispatch('clearLoginData')
		// <% } %>
	}
}

function JwtPlugin(options) {
	this.options = options
}

JwtPlugin.prototype = {
	isLogin() {
		return this.getAccessToken() ? true : false
	},
	getAccessToken() {
		return $nuxt.$store.state.jwt.accessToken
	},
	getRefreshToken() {
		return $nuxt.$store.state.jwt.refreshToken
	},
	getUserData() {
		return $nuxt.$store.state.jwt.userData
	},
	login(data) {
		return $nuxt.$store.dispatch('jwt/login', data)
	},
	logout(data) {
		return $nuxt.$store.dispatch('jwt/logout', data)
	},
	redirect(redirect) {
		if (this.isLogin()) return false
		let loginUrl = this.options.loginUrl + '?redirect=' + encodeURIComponent($nuxt.$route.fullPath)
		redirect ? redirect(loginUrl) : $nuxt.$router.push(loginUrl)
		return true
	}
}

export default function (ctx, inject) {
	const { store, $axios, redirect } = ctx
	// Register Store
	store.registerModule('jwt', { namespaced: true, state, mutations, actions })
	store.dispatch('jwt/nuxtClientInit')
	// Axios interceptors
	// request: set Token
	$axios.onRequest((config) => {
		if (typeof $nuxt === 'undefined') return config
		$axios.setToken(ctx.$jwt.getAccessToken())
		return config
	})
	// response: 401 -> redirect
	$axios.onError((error) => {
		if (typeof $nuxt === 'undefined') return error
		if (error.response && error.response.status + '' === '<%= options.noLoginHttpStatus %>')
			return ctx.$jwt.logout(), redirect('<%= options.noLoginRedirect %>')
		return error
	})
	// Create Instance
	const $jwt = new JwtPlugin(JSON.parse('<%= JSON.stringify(options) %>'))
	ctx.$jwt = $jwt
	inject('jwt', $jwt)
}
