<!-- AIMessage.vue (simple version without markdown) -->
<template>
  <div
    class="flex"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[80%] rounded-lg p-4 shadow-md"
      :class="message.role === 'user'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-800 text-gray-100 border border-gray-700'"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="rounded-full bg-gray-700 p-1.5" v-if="message.role === 'user'">
            <User2 class="h-3.5 w-3.5" />
          </div>
          <div class="rounded-full bg-gray-700 p-1.5" v-else>
            <Bot class="h-3.5 w-3.5" v-if="message.finishedThinking" />
            <Loader2 class="h-3.5 w-3.5 animate-spin" v-else />
          </div>
          
          <span class="text-sm font-medium">
            {{ message.role === 'user' ? 'You' : 'DeepSeek AI' }}
          </span>
        </div>
        
        <button 
          v-if="message.role === 'assistant' && message.think"
          @click="collapsed = !collapsed"
          class="text-xs italic text-gray-300 hover:text-white transition-colors duration-200"
        >
          {{ collapsed ? 'show thoughts' : 'hide thoughts' }}
        </button>
      </div>

      <div v-if="message.role === 'assistant' && !message.finishedThinking" class="flex items-center gap-2 text-gray-400 mb-3">
        <span class="text-sm">Thinking...</span>
      </div>

      <div
        v-if="message.think"
        v-show="!collapsed"
        class="mb-3 text-sm italic border-l-2 border-gray-600 pl-3 py-1.5 text-gray-300 bg-gray-900 bg-opacity-50 rounded"
      >
        <pre class="whitespace-pre-wrap">{{ message.think }}</pre>
      </div>
      
      <div class="prose prose-invert max-w-none text-sm">
        <pre class="whitespace-pre-wrap">{{ message.content }}</pre>
      </div>
    </div>
  </div>
</template>
  
  <script>
  import { ref } from 'vue';
  import { Loader2, Bot, User2 } from 'lucide-vue-next';
  
  export default {
    name: 'AIMessage',
    components: {
      Loader2,
      Bot,
      User2
    },
    props: {
      message: {
        type: Object,
        required: true
      }
    },
    setup() {
      const collapsed = ref(true);
      
      return {
        collapsed
      };
    }
  }
  </script>