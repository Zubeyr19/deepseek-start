<!-- index.vue -->
<template>
  <div class="flex flex-col min-h-screen bg-gray-900">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700 p-4">
      <h1 class="text-xl text-white font-medium">DeepSeek Chat</h1>
    </header>

    <!-- System prompt area -->
    <div class="p-4">
      <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          System Prompt:
          <textarea 
            class="mt-2 w-full rounded-md bg-gray-90 border-gray-700 text-gray-100 p-2 text-sm"
            v-model="premise" 
            rows="3"
          />
        </label>
      </div>
    </div>
    
    <!-- Chat area -->
    <div class="flex-1 p-4 pb-32 overflow-y-auto">
      <div v-if="filteredMessages.length === 0" class="flex flex-col items-center justify-center h-48 text-gray-500">
        <div class="bg-gray-800 p-3 rounded-full mb-3">
          <MessageSquare class="h-6 w-6" />
        </div>
        <p>Ask DeepSeek something to start a conversation</p>
      </div>
      
      <AIMessage 
        v-for="(message, index) in filteredMessages" 
        :key="index" 
        :message="message" 
      />
    </div>

    <!-- Input area -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700">
      <form @submit.prevent="handleSubmit" class="max-w-4xl mx-auto">
        <div class="flex gap-3">
          <div class="flex-1 relative">
            <MessageSquare class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              class="w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 pl-10 py-3 pr-4"
              v-model="input"
              :disabled="loading"
              placeholder="Ask your local DeepSeek..."
            />
          </div>
          <button
            type="submit"
            :disabled="loading || !input.trim()"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          >
            <Loader2 v-if="loading" class="h-5 w-5 animate-spin" />
            <Send v-else class="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { Loader2, MessageSquare, Send } from 'lucide-vue-next';
import AIMessage from '../components/AIMessage.vue';
import Button from '../components/ui/button.vue';
import Input from '../components/ui/input.vue';

export default {
  name: 'AIChat',
  components: {
    AIMessage,
    MessageSquare,
    Loader2,
    Send,
    Button,
    Input
  },
  setup() {
    // Component state
    const messages = ref([]);
    const input = ref('');
    const premise = ref(`You are a software developer assistant with access to company data.

You can retrieve data by mentioning specific data types in your response:
- "Database Status" - Check if the database is running
- "Latest Entry" - Get the most recent entry from the database
- "Table Count" - Get the number of rows in the data table
- "DB Test" - Test the database connection

When a user asks for information that requires accessing the database, indicate you'll check that information.

Keep your answer simple and straight forward.`);    const loading = ref(false);

    // Function to process messages and extract thinking content
    const messagesWithThinkingSplit = computed(() => {
      return messages.value.map((m) => {
        if (m.role === "assistant") {
          if (m.content.includes("</think>")) {
            return {
              ...m,
              finishedThinking: true,
              think: m.content
                .split("</think>")[0]
                .replace("</think>", "")
                .replace("<think>", ""),
              content: m.content.split("</think>")[1],
            };
          } else {
            return {
              ...m,
              finishedThinking: false,
              think: m.content.replace("<think>", ""),
              content: "",
            };
          }
        }
        return m;
      });
    });

    // Filter messages to only show user and assistant messages
    const filteredMessages = computed(() => {
      return messagesWithThinkingSplit.value.filter(
        ({ role }) => role === "user" || role === "assistant"
      );
    });

    // Utility function to stream async responses
    function streamAsyncIterator(reader) {
      const decoder = new TextDecoder("utf-8");
      return {
        async *[Symbol.asyncIterator]() {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) return;
              yield decoder.decode(value);
            }
          } finally {
            reader.releaseLock();
          }
        },
      };
    }

    // Function to handle chat API calls - DIRECTLY CONNECTING TO OLLAMA
    async function chat(payload) {
      // Connect directly to Ollama
      return fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-r1:1.5b", // Use your installed model name
          streaming: true,
          options: {
            temperature: 0.1,
            repeat_penalty: 1.2,
            numa: true,
          },
          messages: [...payload.messages],
        }),
      });
    }

    // Form submission handler
    const handleSubmit = async () => {
  if (!input.value.trim() || loading.value) return;
  
  loading.value = true;
  
  const userInput = input.value;
  input.value = ""; // Clear input field immediately
  
  const messagesWithInput = [
    ...messages.value,
    { role: "system", content: premise.value },
    { role: "user", content: userInput },
  ];
  
  messages.value = messagesWithInput;

  try {
    const stream = await chat({ messages: messagesWithInput });
    if (stream.body) {
      let assistantResponse = "";
      const reader = stream.body.getReader();
      
      for await (const value of streamAsyncIterator(reader)) {
        const {
          message: { content },
        } = JSON.parse(value);
        
        assistantResponse += content;
        
        // Update message in real-time as streaming occurs
        messages.value = [
          ...messagesWithInput,
          {
            role: "assistant",
            content: assistantResponse,
          },
        ];
      }
      
      // After streaming is complete, check if the response mentions database operations
      if (assistantResponse.toLowerCase().includes("check the database") ||
          assistantResponse.toLowerCase().includes("retrieve data")) {
        
        // Parse what data they're asking for
        let dataType = null;
        
        if (assistantResponse.toLowerCase().includes("database status")) {
          dataType = "databaseStatus";
        } else if (assistantResponse.toLowerCase().includes("latest entry")) {
          dataType = "latestEntry";
        } else if (assistantResponse.toLowerCase().includes("table count")) {
          dataType = "tableCount";
        } else if (assistantResponse.toLowerCase().includes("db test")) {
          dataType = "dbTest";
        }
        
        if (dataType) {
          try {
            // Show loading message
            messages.value = [
              ...messagesWithInput,
              {
                role: "assistant",
                content: `${assistantResponse}\n\nI'll check that information for you...`,
              },
            ];
            
            // Fetch the data
            const data = await fetchInternalData(dataType);
            
            // Update the message with the data
            messages.value = [
              ...messagesWithInput,
              {
                role: "assistant",
                content: `${assistantResponse}\n\nI've retrieved the information: ${JSON.stringify(data, null, 2)}`,
              },
            ];
          } catch (error) {
            console.error("Error handling API response:", error);
            // Show error message but keep the original response
            messages.value = [
              ...messagesWithInput,
              {
                role: "assistant",
                content: `${assistantResponse}\n\nI tried to retrieve the data but encountered an error: ${error.message}`,
              },
            ];
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in chat:", error);
    // Show error message to user
    messages.value = [
      ...messagesWithInput,
      {
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again. Make sure Ollama is running locally at http://127.0.0.1:11434.",
      },
    ];
  } finally {
    loading.value = false;
  }
};

    // Additional method to access data from internal systems (if needed)
    const fetchInternalData = async () => {
      try {
       let endpoint; 

       switch(dataType){
        case "databaseStatus":
        
          return fetch("http://localhost:3003/api/chat", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({message: "database status" }) 
          }).then(res => res.json()); 

          case 'dbTest': 
          endpoint = "http://localhost:3003/api/test-db" 
          break; 

          default: 
          endpoint = `http://localhost:3003/api/${dataType}`

       } 

       const response = await fetch(endpoint); 

       if(!response.ok) {
        throw new Error(`Failed to fetch ${dataType}`);
       }

       return await response.json();
      } catch (error) {
        console.error(`Error fetching ${dataType}:`, error);
        return { success: false, error: error.message };
      }
    };

    // Additional method to perform actions (if needed)
    const performAction = async (actionType, params) => {
      try {
        const response = await fetch("http://localhost:3003/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: params }),
        });
        return await response.json();
      } catch (error) {
        console.error(`Error performing action ${actionType}:`, error);
        return { success: false, error: error.message };
      }
    };

    return {
      messages,
      input,
      premise,
      loading,
      filteredMessages,
      handleSubmit,
      fetchInternalData,
      performAction
    };
  }
}
</script>

<style>
/* Additional styles for better appearance */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1e293b;
}

::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>