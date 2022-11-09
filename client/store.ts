import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various components.
 */
const store = new Vuex.Store({
  state: {
    filter: null, // Username to filter shown freets by (null = show all)
    filterReaction: "None",
    freets: [], // All freets created in the app
    comments: [],
    reactions: [],
    username: null, // Username of the logged in user
    silentMode: null,
    silentReactions: null,
    silentComments: null,
    maxStreamSize: "10",
    stream: null,
    streamReactionFilter: null,
    alerts: {} // global success/error messages encountered during submissions to non-visible forms
  },
  getters: {
    itemReactions: (state) => (item) => {
      return state.reactions.filter(reaction => reaction.itemId == item._id)
    },
    freetComments: (state) => (freet) => {
      return state.comments.filter(comment => comment.parentFreet == freet._id)
    }
  },
  mutations: {
    alert(state, payload) {
      /**
       * Add a new message to the global alerts.
       */
      Vue.set(state.alerts, payload.message, payload.status);
      setTimeout(() => {
        Vue.delete(state.alerts, payload.message);
      }, 3000);
    },
    setUsername(state, username) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.username = username;
    },
    setSilentMode(state, silentMode) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.silentMode = silentMode;
    },
    setSilentComments(state, silentMode) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.silentComments = silentMode;
    },
    setSilentReactions(state, silentMode) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.silentReactions = silentMode;
    },
    setMaxStreamSize(state, size) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.maxStreamSize = size;
    },
    setStream(state, stream) {
      console.log("create stream");
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.stream = stream;
    },
    updateFilter(state, filter) {
      /**
       * Update the stored freets filter to the specified one.
       * @param filter - Username of the user to fitler freets by
       */
      state.filter = filter;
    },
    updateFilterReaction(state, filter) {
      /**
       * Update the stored freets filter to the specified one.
       * @param filter - Username of the user to fitler freets by
       */
      state.filterReaction = filter;
    },
    updateFreets(state, freets) {
      console.log('freets updated');
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      state.freets = freets;
    },
    updateReactions(state, reactions) {
      state.reactions = reactions;
    },
    updateComments(state, comments) {
      console.log('comments updated');

      state.comments = comments;
    },
    async refreshAccount(state) {
      console.log('account refreshed');
      /**
       * Request the server for the currently available freets.
       */
      const url = `/api/users/session`;
      const res = await fetch(url).then(async r => r.json());
      console.log(res);
      state.username = res.user.username;
      state.silentMode = res.user.silentMode;
      state.silentComments = res.user.silentComments;
      state.silentReactions = res.user.silentReactions;

      console.log("Sm " + state.silentMode);
      console.log("Sc " + state.silentComments);
      console.log("Sr " + state.silentReactions);
    },
    async refreshFreets(state) {
      console.log('freets refreshed');
      /**
       * Request the server for the currently available freets.
       */
      const url = state.filter ? `/api/users/${state.filter}/freets` : '/api/freets';
      const res = await fetch(url).then(async r => r.json());
      state.freets = res;
    },
    async refreshReactions(state) {
      /**
       * Request the server for the currently available reactions.
       */
      console.log('refreshing reactions');
      const url = `/api/reactions`;
      const res = await fetch(url).then(async r => r.json());
      state.reactions = res;
    },
    async refreshComments(state) {
      /**
       * Request the server for the currently available comments.
       */
      console.log('refreshing comments');
      const url = `/api/comments`;
      const res = await fetch(url).then(async r => r.json());
      state.comments = res;
    },
    async refreshStream(state) {
      /**
       * Request the server for the currently available comments.
       */
      console.log('refreshing stream');
      const url2 = `/api/streams?ownerId=${state.username}`;
      const res2 = await fetch(url2).then(async r => r.json());
      console.log(res2);
      state.stream = res2;
      state.maxStreamSize = state.stream.maxSize;
      console.log(state.stream);
    }
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
