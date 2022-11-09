<!-- Page for account settings and management -->
<!-- User should be authenticated in order to see this page -->

<template>
    <main>
      <section>
        <header>
          <h2>Your Stream</h2>
        </header>
      </section>
      <section>
        <StreamSettings
        :stream="this.$store.state.stream"/>
      </section>
      <section>
        <StreamComponent
        :stream="this.$store.state.stream"
        :reactionFiltering="this.$store.state.filterReaction"/>
      </section>
    </main>
</template>
  
<script>
    import StreamComponent from '@/components/Stream/StreamComponent.vue';
    import StreamSettings from '@/components/Stream/StreamSettings.vue';
    export default {
        name: 'StreamPage',
        components: {
            StreamSettings,
            StreamComponent
        }
    };
</script>
  