<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <h3 class="author" v-if="freet.author">
        @{{ freet.author }}
      </h3>
      <h3 class="author" v-else>
        @{{ author }}
      </h3>
      <div
        v-if="$store.state.silentReactions == false"
        >
      <div class="big-reaction-box" v-if="bigReaction !== ''">
        <figure class="big-reaction">{{bigReaction}}</figure>
      </div>
      </div>
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button @click="deleteFreet">
          🗑️ Delete
        </button>
      </div>
    </header>
    <p
      class="content"
    >
      "{{ freet.content }}"
    </p>
    <div v-if="inStream">
      <button @click="captureFreet">📌 Capture</button>
    </div>
    <div v-if="captured">
      <button @click="releaseFreet">❌ Release</button>
    </div>
    <div v-if="inStream">
      <button @click="removeFreet">🎲 Replace</button>
    </div>
    <p class="info">
      Posted at {{ freet.dateModified }}
    </p>

    <div
        v-if="$store.state.silentReactions == false"
        >
    <ReactionComponent
      :itemType="'Freet'"
      :item="freet"
      :reactions="freetReactions"
    />
  </div>
  <section v-if="$store.state.silentReactions">
    <footer>~Disable Silent Mode to View Reactions~</footer>
  </section>
    <section
        v-if="$store.state.silentComments == false"
      >
        <div
        v-if="$store.state.username"
        >
          <CreateCommentForm
            :parentFreetId="this.freet._id"
          />
        </div>
        <section v-if="$store.state.comments.length && freetComments && freet">
        <CommentComponent
          v-for="commentSingle in freetComments"
          :key="commentSingle.id"
          :parentFreetInstance="freet"
          :comment="commentSingle"
        />
        </section>
      </section>
    <section v-else>
        <footer>~Disable Silent Mode to View Comments~</footer>
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
import CommentComponent from '@/components/Comment/CommentComponent.vue';
import CreateCommentForm from '@/components/Comment/CreateCommentForm.vue';

export default {
  name: 'FreetComponent',
  components: {ReactionComponent, CommentComponent,CreateCommentForm},
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    },
    inStream:{
      type: Boolean,
      required: false
    },
    captured:{
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      draft: this.freet.content, // Potentially-new content for this freet
      alerts: {}, // Displays success/error messages encountered during freet modification
      author: this.freet.authorId
    };
  },
  computed: {
      freetComments() {
        const value = this.$store.getters.freetComments(this.freet) ? this.$store.getters.freetComments(this.freet) : [];
        return value
      },
      freetReactions() {
        return this.$store.getters.itemReactions(this.freet);
      },
      bigReaction(){
        const reactions = this.$store.getters.itemReactions(this.freet);
        if(reactions){

          const reactionCount = [0,0,0,0,0,0,0];
          const reactionIndex = {"Like":0,"Dislike":1,"Wow":2,"Love":3,"Sad":4,"Angry":5,"None":6};
          const reactionTypes = ['👍','👎','😮','❤️','😢','😡',''];
          let biggestReaction = "None";

          for(const reaction of reactions){
              reactionCount[reactionIndex[reaction.reactionType]] += 1;
              if(reactionCount[reactionIndex[reaction.reactionType]] > reactionCount[reactionIndex[biggestReaction]]){
                biggestReaction = reaction.reactionType;
              }
          }
          return reactionTypes[reactionIndex[biggestReaction]];
        }
        return "";
      }
  },
  methods: {
    removeFreet() {
      this.$emit("remove-freet",{freet: this.freet});
    },
    async getAuthor(){
        const author = this.freet.authorId;
  
        try {
          if(author && author !== "undefined"){
            const r = await fetch(`/api/users/userId/?userId=${author}`).then(async r => r.json());
            if(r && r!=="undefined"){
              this.author = r.user.username;
            }
          }

        } catch (e) {
          console.log(e);
        }
    },
    captureFreet(){
      this.$emit("capture-freet",{freet: this.freet});
    },
    releaseFreet(){
      this.$emit("release-freet",{freet: this.freet});
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    async request(params) {
      /**
       * Submits a request to the freet's endpoint
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
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');

        params.callback();
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  },
  mounted() {
    this.getAuthor();
  }
};
</script>

<style scoped>
.freet {
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
  right: 3%;
  top: 0%;
}
</style>
