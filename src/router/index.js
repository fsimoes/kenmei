import Vue from 'vue';
import Router from 'vue-router';
import { Message } from 'element-ui';
import store from '@/store/index';

import NotFound from '@/views/NotFound.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      // Catch all 404 page
      path: '*',
      component: NotFound,
    },
    {
      path: '/',
      component: () => import(/* webpackChunkName: "manga_list" */ '@/views/MangaList.vue'),
    },
    {
      path: '/about',
      name: 'about',
      beforeEnter() { Message.info('Under development'); }
    },
    {
      path: '/terms',
      name: 'terms',
      beforeEnter() { Message.info('Under development'); }
    },
    {
      path: '/privacy',
      name: 'privacy',
      beforeEnter() { Message.info('Under development'); }
    },
    {
      path: '/changelog',
      beforeEnter() { location.href = 'https://news.kenmei.co/changelog' }
    },
    {
      path: '/blog',
      beforeEnter() { location.href = 'https://news.kenmei.co/updates' }
    },
    {
      path: '/supported-sites',
      name: 'sources',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "manga_list" */ '@/views/Sources.vue'),
    },
    {
      path: '/manga-list',
      name: 'manga-list',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "manga_list" */ '@/views/MangaList.vue'),
      beforeEnter: (to, from, next) => {
        if (store.getters["user/signedIn"]) {
          next();
        } else {
          Message.error('Please sign in first');
          next('/');
        }
      },
    },
    {
      path: '/reset-password/:resetPasswordToken',
      name: 'Reset Password',
      component: () => import(/* webpackChunkName: "sign_in" */ '@/views/ResetPassword.vue'),
      props: true,
      beforeEnter: (to, from, next) => {
        if (store.getters["user/signedIn"]) {
          Message.info('You are already signed in');
          next('/manga-list');
        } else {
          next();
        }
      },
    },
    {
      path: '/confirmation/:confirmationToken',
      name: 'User Confirmation',
      component: () => import(/* webpackChunkName: "user_confirmation" */ '@/views/UserConfirmation.vue'),
      props: true,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import(/* webpackChunkName: "settings" */ '@/views/Settings.vue'),
      beforeEnter: (to, from, next) => {
        if (store.getters["user/signedIn"]) {
          next();
        } else {
          Message.error('Please sign in first');
          next('/');
        }
      },
    },
    {
      path: '/sign-out',
      name: 'Sign Out',
      beforeEnter: async (to, from, next) => {
        if (store.getters["user/signedIn"]) {
          await store.dispatch('user/signOut');

          next('/');
        } else {
          Message.info("You've already signed out");
        }
      },
    },
  ]
});
