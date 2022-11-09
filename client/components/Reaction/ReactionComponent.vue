<template>
    <article
      class="reactions"
    >
    <main>
      <span>    
        <button class="button" @click="updateReaction('Like')">👍</button> 
        <strong v-if="getUserReactionType=='Like'">   {{getLikeReactions}}   </strong>
        <span v-else> {{getLikeReactions}} </span>
      </span>
  
      <span>
        <button class="button" @click="updateReaction('Dislike')">👎</button>
        <strong v-if="getUserReactionType=='Dislike'">   {{getDislikeReactions}}   </strong>
        <span v-else> {{getDislikeReactions}} </span>
      </span>
  
      <span>
        <button class="button" @click="updateReaction('Wow')">😮</button>
        <strong v-if="getUserReactionType=='Wow'">   {{getWowReactions}}   </strong>
        <span v-else> {{getWowReactions}} </span>
      </span>
  
      <span>
        <button class="button" @click="updateReaction('Love')">❤️</button>
        <strong v-if="getUserReactionType=='Love'">   {{getLoveReactions}}   </strong>
        <span v-else> {{getLoveReactions}} </span>
      </span>
  
      <span>
        <button class="button" @click="updateReaction('Sad')">😢</button>
        <strong v-if="getUserReactionType=='Sad'">   {{getSadReactions}}   </strong>
        <span v-else> {{getSadReactions}} </span> 
      </span>
  
      <span>
        <button class="button" @click="updateReaction('Angry')">😡</button>
        <strong v-if="getUserReactionType=='Angry'">   {{ getAngryReactions }}  </strong>
        <span v-else> {{getAngryReactions}} </span>
      </span>
    
      <section class="alerts">
        <article
          v-for="(status, alert, index) in alerts"
          :key="index"
          :class="status"
        >
          <p>{{ alert }}</p>
        </article>
      </section>
    </main>
    </article>
  </template>

  <script>
export default {
  name: 'ReactionComponent',
  props: {
    // Data from the stored freet
    itemType: {
      type: String,
      required: true
    },
    item: {
      type: Object,
      required: true
    },
    reactions: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      alerts: {}, // Displays success/error messages encountered during freet modification
    };
  },
  computed: {
    userReaction(){  
        return this.reactions.filter(reaction => reaction.author == this.$store.state.username)[0]
    },
    getUserReactionType(){
      if(this.userReaction){
        return this.reactions.filter(reaction => reaction.author == this.$store.state.username)[0].reactionType
      }
      return ""
    },
    getAngryReactions(){
        return this.reactions.filter(reaction => reaction.reactionType == "Angry").length;
    },
    getLikeReactions(){
        return this.reactions.filter(reaction => reaction.reactionType == "Like").length;
    },
    getDislikeReactions(){
        return this.reactions.filter(reaction => reaction.reactionType == "Dislike").length;
    },
    getWowReactions(){
        return this.reactions.filter(reaction => reaction.reactionType == "Wow").length;
    },
    getSadReactions(){
        return this.reactions.filter(reaction => reaction.reactionType == "Sad").length;
    },
    getLoveReactions(){
        return this.reactions.filter(reaction => reaction.reactionType == "Love").length;
    },
  },
  methods: {
    updateReaction(reaction){
      if(this.userReaction && reaction == this.userReaction.reactionType){
          //Delete Reaction if clicking reaction already reacted to.
          const params = {
            method: 'DELETE',
          };
          this.reactionRequest(params);
      }
      else if(!this.userReaction){

        const params = {
            method: 'POST',
            body: JSON.stringify({itemId: this.item._id, itemType: this.itemType, reactionType: reaction})
          };
          this.reactionRequest(params);
      }
      else{
        const params = {
            method: 'PUT',
            body: JSON.stringify({reactionType: reaction})
          };
          this.reactionRequest(params);
      }
    },
    async reactionRequest(params) {
      /**
       * Submits a request to the reaction's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const reactionId = this.userReaction ? this.userReaction._id : "";
        const r = await fetch(`/api/reactions/${reactionId}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
        this.$store.commit('refreshReactions');

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>

.reactions {
  position: relative;
  font-size: 2em;
  width: 100%;
  max-height:2em;
  text-align:center;
}
.button {
  color: black;
  text-align: center;
  font-size: 0.7em;
}
</style>