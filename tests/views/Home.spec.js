import Vuex from 'vuex';
import Home from '@/views/Home.vue';

import user from '@/store/modules/user';

const localVue = createLocalVue();

localVue.use(Vuex);

// To avoid missing directive Vue warnings
localVue.directive('loading', true);
localVue.directive('scroll-to', true);

describe('Home.vue', () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          state: {
            currentUser: null,
            dissmissedBannerID: null,
          },
          mutations: user.mutations,
          getters: user.getters,
        },
      },
    });
  });

  describe('when dissmissedBannerID is null', () => {
    it('shows banner', async () => {
      const home = shallowMount(Home, {
        store,
        localVue,
        stubs: ['router-link', 'router-view'],
      });

      await home.setData({ landing: false });

      expect(home.find('base-banner-stub').element).toBeVisible();
    });
  });

  describe('when dissmissedBannerID matches updateBanner ID', () => {
    it('hides banner', async () => {
      store.state.user.dissmissedBannerID = 1;
      const home = mount(Home, {
        store,
        localVue,
        data() {
          return {
            landing: false,
          };
        },
        stubs: ['router-link', 'router-view'],
      });

      await home.setData({ updateBanner: { id: 1 }, landing: false });

      expect(home.findComponent({ ref: 'banner' }).element).toHaveStyle('height: 0px');
    });
  });
});
