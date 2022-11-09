<template>
    <article
    class="comment"
  >
  <header>
    <h3 class="author">
      @{{ comment.author }} commented
    </h3>
    <div class="big-reaction-box">
    <section class="reaction" v-if="authorReaction !== ''"> {{ comment.author }}'s reaction: </section>
    <figure class="big-reaction">{{authorReaction}}</figure>
    </div>
    <div
      v-if="$store.state.username === comment.author"
      class="actions"
    >
      <button @click="deleteComment">
        🗑️ Delete
      </button>
    </div>
  </header>

  <p
      class="content"
    >
      "{{comment.content}}"
    </p>
    <p class="info">
      Posted at {{ comment.dateModified }}
    </p>
    <section v-if="$store.state.silentReactions == false">
      
    <ReactionComponent
      :itemType="'Comment'"
      :item="this.comment"
      :reactions="this.commentReactions"
    />
    </section>

    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </article>
</template>

<script>

import ReactionComponent from '@/components/Reaction/ReactionComponent.vue';

export default {
  name: 'CommentComponent',
  components: {ReactionComponent},
  props: {
    // Data from the stored freet
    parentFreetInstance: {
      type: Object,
      required: true
    },
    comment: {
        type: Object,
        required: true
    }
  },
  data() {
    return {
      alerts: {}, // Displays success/error messages encountered during freet modification
    };
  },
  computed: {
      commentReactions() {
        return this.$store.getters.itemReactions(this.comment);
      },
      authorReaction(){
        const reactions = this.$store.getters.itemReactions(this.parentFreetInstance);
        const reaction = reactions.filter(reaction => reaction.author == this.comment.author)[0]

        if(reaction){
          const reactionIndex = {"Like":0,"Dislike":1,"Wow":2,"Love":3,"Sad":4,"Angry":5,"None":6};
          const reactionTypes = ['👍','👎','😮','❤️','😢','😡',''];

          return reactionTypes[reactionIndex[reaction.reactionType]]
        }
        return "";
      }
  },
  methods: {
    deleteComment() {
      /**
       * Deletes this comment.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted comment!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the comment's endpoint
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
        const r = await fetch(`/api/comments/${this.comment._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshComments');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
.comment {
    border: 1px solid #264027;
    padding: 20px;
    position: relative;
    background-color: #F9FAF7;
}

.reaction {
  position:relative;
  right: -0.5em;
  top: 1.2em;
}
.big-reaction {
  font-size: 3.6em;
  position:relative;
  right: 0;
  top: -0.5em;
}

.big-reaction-box {
  position:absolute;
  right: 2%;
  top: 0%;
}
</style>