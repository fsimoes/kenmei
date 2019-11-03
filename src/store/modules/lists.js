import { Message } from 'element-ui';
import { secure } from '@/modules/axios';

import { extractSeriesID } from '@/services/api';

const state = {
  lists: [],
  entries: [],
  listsLoading: false,
};

const getters = {
  getEntriesByListId: state => listID => state.entries.filter(
    entry => entry.relationships.manga_list.data.id === listID
  ),
  entryAlreadyExists: state => mangaURL => state.entries.some(
    manga => extractSeriesID(manga.links.series_url) === extractSeriesID(mangaURL)
  ),
};

const actions = {
  getLists({ commit }) {
    commit('setListsLoading', true);

    return secure.get('/api/v1/manga_lists/')
      .then((response) => {
        commit('setLists', response.data.data);
        commit('setEntries', response.data.included);
      })
      .catch((request) => { Message.error(request.response.data.error); })
      .then(() => { commit('setListsLoading', false); });
  },
};

const mutations = {
  setLists(state, data) {
    state.lists = data;
  },
  setEntries(state, data) {
    state.entries = data;
  },
  addEntry(state, data) {
    state.entries.push(data);
  },
  updateEntry(state, data) {
    const index = state.entries.findIndex(entry => entry.id === data.id);
    state.entries.splice(index, 1, data);
  },
  removeEntries(state, entryIDs) {
    state.entries = state.entries.filter(
      (mangaEntry, _index, _arr) => !entryIDs.includes(mangaEntry.id)
    );
  },
  setListsLoading(state, data) {
    state.listsLoading = data;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
