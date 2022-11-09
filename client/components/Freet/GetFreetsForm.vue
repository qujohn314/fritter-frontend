<!-- Form for getting freets (all, from user) (inline style) -->

<script>
import InlineForm from '@/components/common/InlineForm.vue';

export default {
  name: 'GetFreetsForm',
  mixins: [InlineForm],
  data() {
    return {value: this.$store.state.filter};
  },
  methods: {
    async submit() {
      const url = this.value ? `/api/freets?author=${this.value}` : '/api/freets';
      try {
        const r = await fetch(url);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.$store.commit('updateFilter', this.value);
        this.$store.commit('updateFreets', res);
      } catch (e) {
        if (this.value === this.$store.state.filter) {
          // This section triggers if you filter to a user but they
          // change their username when you refresh
          this.$store.commit('updateFilter', null);
          this.value = ''; // Clear filter to show all users' freets
          this.$store.commit('refreshFreets');
          this.$store.commit('refreshReactions');
          this.$store.commit('refreshComments');
        } else {
          // Otherwise reset to previous fitler
          this.value = this.$store.state.filter;
        }

        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }

      const reactionUrl = '/api/reactions'
      try {
        const r = await fetch(reactionUrl);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.$store.commit('updateReactions', res);
        this.$store.commit('refreshReactions', res);
      } catch (e) {
          this.$store.commit('refreshReactions');
      

        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }

      const commentUrl = '/api/comments'
      try {
        const r = await fetch(commentUrl);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.$store.commit('updateComments', res);
        this.$store.commit('refreshComments', res);
      } catch (e) {
          this.$store.commit('refreshComments');
      

        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
    
  }
};
</script>
