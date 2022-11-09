<!-- Page for account settings and management -->
<!-- User should be authenticated in order to see this page -->

<template>
    <main>
        <article>
            <section>
                Max # of Freets in Stream: {{maxSize}}
            </section>
            <section>
                Filter Stream on Reaction: {{filteredReaction}}
            </section>
            <button @click="editSettings()" v-if="!editingSettings">Update Settings</button>
        </article>


        <section v-if="editingSettings">
            <br/>
            <label for="max-stream-size">Stream Capacity: Max # of Freets in Stream (Between 5-15)</label><br/>
            <input type="text" id="max-steam-size" name="max-stream-size" v-model="tempMaxSize"/><br/>

            <label for="filter-reaction">Stream Reaction Filter</label><br/>
            <select id="filter-temp-reaction" name="filter-temp-reaction" v-model="filterTempReaction">
                <option value="None">---</option>
                <option value="Like">👍</option>
                <option value="Dislike">👎</option>
                <option value="Wow">😮</option>
                <option value="Love">❤️</option>
                <option value="Sad">😢</option>
                <option value="Angry">😡</option>
            </select> <br/>

            <button @click="updateSettings()">save settings</button>
            <button @click="closeSettings()">Cancel</button><br/>
        </section>
    </main>
</template>
  
<script>
    
    export default {
        name: 'StreamSettings',
        props: {
            stream: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
               filterTempReaction: "None",
               editingSettings: false,
               tempMaxSize: this.$store.state.maxStreamSize,
               alerts: {}
            }
        },
        computed: {
            filteredReaction() {
                return this.$store.state.filterReaction;
            },
            maxSize: {
                get () {
                    return this.$store.state.maxStreamSize;
                },
                set (value) {
                    this.$store.commit('setMaxStreamSize', value);
                }
            },
            getFilteredReaction(){
                const reactions = {"None":"None","Like":'👍',"Dislike":'👎',"Wow":'😮',"Love":'❤️',"Sad":'😢',"Angry":'😡'}
                return reactions[this.filterTempReaction];
            }
            
        },
        methods: {
            editSettings(){
                this.editingSettings = true;
            },
            closeSettings(){
                this.editingSettings = false;
            },
            updateSettings(){
                try {
                    if(this.tempMaxSize < 5 || this.tempMaxSize > 15 || !Number(this.tempMaxSize)){
                        throw new Error("Stream capacity must be between 5-15 inclusive.");
                    }
                }catch (e) {
                    this.$set(this.alerts, e, 'Stream capacity must be between 5-15 inclusive.');
                    setTimeout(() => this.$delete(this.alerts, e), 3000);
                    const v = {callback: () => {
                    this.$store.commit('alert', {
                        message: 'Stream capacity must be between 5-15 inclusive.', status: 'error'
                    });}}
                    
                    v.callback();
                    
                    return;
                }
                
                this.$store.commit('updateFilterReaction', this.getFilteredReaction);
                console.log(this.$store.state.filterReaction);

                this.editingSettings = false;
                const params = {
                    method: 'PUT',
                    body: JSON.stringify({
                        maxSize: this.tempMaxSize
                    }),
                    callback: () => {
                    this.$store.commit('alert', {
                        message: 'Successfully updated stream settings!', status: 'success'
                    });
                    }
                };
                this.request(params,`/api/streams/streamParams`);
            },
            async request(params,url) {
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
                console.log("Stream options: ");
                console.log(options);
                try {
                    const r = await fetch(url, options);
                    if (!r.ok) {
                    const res = await r.json();
                    throw new Error(res.error);
                    }
                    console.log(r);
                    this.$store.commit('refreshStream');

                    params.callback();
                } catch (e) {
                    this.$set(this.alerts, e, 'error');
                    setTimeout(() => this.$delete(this.alerts, e), 3000);
                }
            }
        }
    };
</script>
  