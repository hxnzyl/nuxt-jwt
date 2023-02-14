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
		commit('SET_USER_DATA', JSON.parse(localStorage.getItem('userData')) || null)
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
		commit('SET_USER_DATA', userData)
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
	// <% if (options.loginApi) { %>
	/**
	 * 登录
	 *
	 * @param {Vuex.Store} param0
	 * @param {Object} param1
	 * @returns {Promise}
	 */
	login({ dispatch }, { data, redirect, checkData }) {
		return new Promise((resolve) => {
			this.$axios
				.post('<%= options.loginApi %>', data)
				.then((res) => {
					if ((checkData = (checkData && checkData(res.data)) || res.data))
						dispatch('updateLoginData', checkData), redirect && $nuxt.$router.push(decodeURIComponent(redirect)), resolve([true, checkData])
					else resolve([false, checkData])
				})
				.catch((error) => resolve([false, error]))
		})
	},
	// <% } %>
	/**
	 * 登出
	 *
	 * @param {Vuex.Store} param0
	 * @returns {Promise}
	 */
	logout({ dispatch }, { data, reload }) {
		// <% if (!options.logoutApi) { %>
		let res = dispatch('clearLoginData')
		reload && location.reload()
		return [true, res]
		// <% } %>
		// <% if (options.logoutApi) { %>
		return new Promise((resolve, reject) => {
			this.$axios
				.post('<%= options.logoutApi %>', data)
				.then((res) => (dispatch('clearLoginData'), reload && location.reload(), resolve([true, res.data])))
				.catch((error) => reject([false, error]))
		})
		// <% } %>
	}
}

function JwtPlugin(options) {
	this.options = options
}

JwtPlugin.prototype = {
    isLogin() {
        return $nuxt.$store.state.jwt.accessToken ? true :false
    },
	login(data = {}) {
		return $nuxt.$store.dispatch('jwt/login', data)
	},
	logout(data = {}) {
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
	// Register Store
	ctx.store.registerModule('jwt', { namespaced: true, state, mutations, actions })
	ctx.store.dispatch('jwt/nuxtClientInit')
	// Create Instance
	const $jwt = new JwtPlugin(<%= JSON.stringify(options, null, 4) %>)
	ctx.$jwt = $jwt
	inject('jwt', $jwt)
}
