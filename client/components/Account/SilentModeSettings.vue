<template>
<article>
    <h3>Configure Silent Mode</h3>

    <!-- Rounded switch -->
    <section>
    Toggle Silent Mode
    <label class="switch">
        <input type="checkbox" v-model="silentMode" @click="silentChecked()">
        <span class="slider round"></span>
    </label>
    </section>

    <section>
        Toggle Comment Visibility
        <label class="switch">
            <input type="checkbox" v-model="silentComments" @click="commentsChecked()">
            <span class="slider round"></span>
        </label>
    </section>

    <section>
        Toggle Reaction Visibility
        <label class="switch">
            <input type="checkbox" v-model="silentReactions" @click="reactionsChecked()">
            <span class="slider round"></span>
        </label>
    </section>


</article>
</template>

<script>
export default {
  name: 'SilentModeSettings',
  data() {
    return {
       
    }
  },
  computed: {
    silentMode: {
        get () {
            return this.$store.state.silentMode;
        },
        set (value) {
            this.$store.commit('setSilentMode', value);
        }
    },
    silentComments: {
        get () {
            return this.$store.state.silentComments;
        },
        set (value) {
            this.$store.commit('setSilentComments', value);
        }
    },
    silentReactions: {
        get () {
            return this.$store.state.silentReactions;
        },
        set (value) {
            this.$store.commit('setSilentReactions', value);
        }
    }
},
  methods: {
    silentChecked() {
        this.silentMode = !this.silentMode;
        this.$store.commit('setSilentMode', this.silentMode);
        const params = {
            method: 'PUT',
            url: `api/users/silentMode/${this.silentMode}`,
        };

        this.request(params);
        return this.silentMode;
    },
    commentsChecked() {
        this.silentComments = !this.silentComments;
        this.$store.commit('setSilentComments', this.silentComments);
        const params = {
            method: 'PUT',
            url: `api/users/silentComments/${this.silentComments}`,
        };

        this.request(params);
        return this.silentComments;
    },
    reactionsChecked() {
        this.silentReactions = !this.silentReactions;
        this.$store.commit('setSilentReactions', this.silentReactions);
        const params = {
            method: 'PUT',
            url: `api/users/silentReactions/${this.silentReactions}`,
        };

        this.request(params);

        return this.silentReactions;
    },
    async request(params){
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
        const r = await fetch(params.url, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }
        console.log("Here?");
        this.$store.commit('refreshAccount');

    
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }

  }
  },
  
};


</script>

<style scoped>
/* The switch - the box around the slider */
.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
    outline: 0px;
  }
  
  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
    outline: 0px;
  }
  
  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
    outline: 0px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
    outline: 0px;
  }
  
  input:checked + .slider {
    background-color: #2196F3;
    outline: 0px;
  }
  
  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
    outline: 0px;
  }
  
  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
    outline: 0px;
  }


  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
    outline: 0px;
  }
  
  .slider.round:before {
    border-radius: 50%;
    outline: 0px;
  }


</style>