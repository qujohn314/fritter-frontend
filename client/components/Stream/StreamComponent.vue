<!-- Page for account settings and management -->
<!-- User should be authenticated in order to see this page -->

<template>
    <main>
    <h2 v-if="populating">Populating Stream. Waiting...</h2>
    <h2 v-if="clearing">Emptying Stream. Waiting...</h2>
    <button @click="removeAllFreets"> Replace All Freets </button>
    <section v-if="stream.capturedFreets.length">
        <FreetComponent
            v-for="freet in stream.capturedFreets"
            :key="freet.id"
            :freet="freet"
            :captured="true"
            :inStream="false"
            @release-freet="releaseFreet"
            @remove-freet="removeFreet"
        />
    </section>
    <section v-if="stream.streamFreets.length">
        <FreetComponent
            v-for="freet in stream.streamFreets"
            :key="freet.id"
            :freet="freet"
            :inStream="true"
            :captured="false"
            @capture-freet="captureFreet"
            @remove-freet="removeFreet"
        />
    </section>
    </main>
</template>
  
<script>
    import FreetComponent from '@/components/Freet/FreetComponent.vue';
    export default {
        name: 'StreamComponent',
        components: {
            FreetComponent
        },
        data() {
            return {
                clearing: false,
                populating: false
            }
        },
        props: {
            stream: {
                type:Object,
                required: true
            },
            reactionFiltering: {
                type: String,
                required: false
            }
        },
        computed: {
        },
        methods: {
            async captureFreet(child) {
                const freet = child.freet;
                console.log("child captured!");
                console.log(freet);

                const params = {
                        method: 'PUT',
                        body: JSON.stringify({
                        freetId: freet._id
                        })
                    };
                    console.log("capturing");
                    const options = {
                        method: params.method, headers: {'Content-Type': 'application/json'}
                    };

                    try {
                        const r = await fetch(`/api/streams/capture/${freet._id}`, options);
                        if (!r.ok) {
                            const res = await r.json();
                            throw new Error(res.error);
                        }
                        console.log(r);
                        this.$store.commit('refreshStream');
                    }catch (e) {
                        console.log(e);
                    }

            },
            async releaseFreet(child) {
                const freet = child.freet;
                console.log("child released!");
                console.log(freet);

                const params = {
                        method: 'PUT',
                        body: JSON.stringify({
                        freetId: freet._id
                        })
                    };
                    console.log("releasing");
                    const options = {
                        method: params.method, headers: {'Content-Type': 'application/json'}
                    };

                    try {
                        const r = await fetch(`/api/streams/release/${freet._id}`, options);
                        if (!r.ok) {
                            const res = await r.json();
                            throw new Error(res.error);
                        }
                        console.log(r);
                        this.$store.commit('refreshStream');
                    }catch (e) {
                        console.log(e);
                    }
            },
            async removeFreet(child) {
                const freet = child.freet;
                console.log("child released!");
                console.log(freet);

                const params = {
                        method: 'DELETE',
                        body: JSON.stringify({
                        freetId: freet._id
                        })
                    };
                    console.log("deleting");
                    const options = {
                        method: params.method, headers: {'Content-Type': 'application/json'}
                    };

                    try {
                        const r = await fetch(`/api/streams/${freet._id}`, options);
                        if (!r.ok) {
                            const res = await r.json();
                            throw new Error(res.error);
                        }
                        console.log(r);
                        this.$store.commit('refreshStream');
                    }catch (e) {
                        console.log(e);
                    }
                    this.populateStream();
            },
            async removeAllFreets() {
                this.clearing = true;
                for(const freet of this.stream.streamFreets){
                    console.log("child released!");
                    console.log(freet);

                    const params = {
                            method: 'DELETE',
                            body: JSON.stringify({
                            freetId: freet._id
                            })
                        };
                        console.log("deleting");
                        const options = {
                            method: params.method, headers: {'Content-Type': 'application/json'}
                        };

                        try {
                            const r = await fetch(`/api/streams/${freet._id}`, options);
                            if (!r.ok) {
                                const res = await r.json();
                                throw new Error(res.error);
                            }
                            console.log(r);
                            this.$store.commit('refreshStream');
                        }catch (e) {
                            console.log(e);
                        }
                }
                this.clearing = false;
                this.populateStream();
            },
            async populateStream(){
                this.populating = true;
                const freets = []
                for(const f of this.$store.state.freets){
                    freets.push(f);
                }
                let count = 0;
                while(count <= 2*this.$store.state.maxStreamSize && this.stream.capturedFreets.length + this.stream.streamFreets.length < this.$store.state.maxStreamSize && this.stream.capturedFreets.length + this.stream.streamFreets.length < this.$store.state.freets.length && freets.length){
                    count += 1;
                    const i = Math.floor(Math.random()*freets.length);
                    const freet = freets.pop(i);

                    const reactions = this.$store.getters.itemReactions(freet);

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
                    const bigReaction = reactionTypes[reactionIndex[biggestReaction]];
                    if(this.reactionFiltering && this.reactionFiltering !== "None" && bigReaction !== this.reactionFiltering){
                        continue
                    }
                    

                    const params = {
                        method: 'PUT',
                        body: JSON.stringify({
                        freetId: freet._id
                        })
                    };
                    console.log("oops");
                    const options = {
                        method: params.method, headers: {'Content-Type': 'application/json'}
                    };

                    try {
                        const r = await fetch(`/api/streams/${freet._id}`, options);
                        if (!r.ok) {
                            const res = await r.json();
                            throw new Error(res.error);
                        }
                        console.log(r);
                        this.$store.commit('refreshStream');
                    }catch (e) {
                        continue;
                    }

                }
                this.populating = false;
            }
        },
        mounted() {
            this.populateStream();
            this.$store.commit('refreshStream');
        },
        
    }
</script>
  