import { Message } from 'element-ui';
import { secure, plain } from '@/modules/axios';

const state = {
  currentUser: null,
  dissmissedBannerID: null,
};

const getters = {
  signedIn: (state) => state.currentUser !== null,
};

const actions = {
  signIn({ commit }, data) {
    return plain.post('/api/v1/sessions/', { user: data })
      .then((response) => {
        commit('setCurrentUser', {
          user_id: response.data.user_id,
          email: response.data.email,
          unconfirmedEmail: response.data.unconfirmedEmail,
        });
        localStorage.access = response.data.access;
      })
      .catch((request) => {
        if (request.response.data.error === 'User unconfirmed') {
          Message.info(
            'Please check your email inbox and confirm your account first',
          );
        } else {
          Message.error(request.response.data.error);
        }
      });
  },
  signOut({ commit }) {
    return secure.delete('/api/v1/sessions/')
      .then(() => {
        commit('setCurrentUser', null);
        delete localStorage.access;
      })
      .catch((request) => {
        if (request.response.data.error === 'Signature has expired') {
          commit('setCurrentUser', null);
          delete localStorage.access;
        } else {
          Message.error(request.response.data.error);
        }
      });
  },
};

const mutations = {
  setCurrentUser(state, data) {
    state.currentUser = data;
  },
  dismissUpdateBanner(state, data) {
    state.dissmissedBannerID = data;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
