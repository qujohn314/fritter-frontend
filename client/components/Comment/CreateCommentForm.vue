
<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateCommentForm',
  mixins: [BlockForm],
  props: {
    parentFreetId: {
        type: String,
        required: true
    }
  },
  data() {
    return {
      url: `/api/comments/${this.parentFreetId}`,
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'content', label: 'Content', value: ''}
      ],
      title: 'Add a comment',
      refreshFreets: true,
      callback: () => {
        const message = 'Successfully created a comment!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
