// React + Apollo Client 集成示例
//
// 首先安装依赖:
// npm install @apollo/client graphql

import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useMutation, useQuery } from '@apollo/client';

// 创建 Apollo Client 实例
const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
});

// GraphQL 查询
const HEALTH_QUERY = gql`
  query Health {
    health {
      status
      timestamp
    }
  }
`;

// GraphQL 变更 - 聊天
const CHAT_MUTATION = gql`
  mutation Chat($input: ChatInput!) {
    chat(input: $input) {
      success
      message
      data {
        reply
        model
        timestamp
      }
    }
  }
`;

// GraphQL 变更 - 生成图片
const GENERATE_IMAGE_MUTATION = gql`
  mutation GenerateImage($input: ImageGenerationInput!) {
    generateImage(input: $input) {
      success
      message
      data {
        urls
        timestamp
      }
    }
  }
`;

// 健康检查组件
function HealthCheck() {
  const { loading, error, data } = useQuery(HEALTH_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h3>Health Status</h3>
      <p>Status: {data.health.status}</p>
      <p>Time: {data.health.timestamp}</p>
    </div>
  );
}

// 聊天组件
function ChatComponent() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chat, { loading }] = useMutation(CHAT_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const messages = [
        ...chatHistory,
        { role: 'user', content: message }
      ];

      const { data } = await chat({
        variables: {
          input: {
            messages: messages,
            model: 'gpt-3.5-turbo'
          }
        }
      });

      if (data.chat.success) {
        setChatHistory([
          ...messages,
          { role: 'assistant', content: data.chat.data.reply }
        ]);
        setMessage('');
      }
    } catch (error) {
      console.error('Chat error:', error);
      alert('聊天失败: ' + error.message);
    }
  };

  return (
    <div>
      <h3>AI Chat</h3>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', height: '300px', overflowY: 'auto' }}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入消息..."
          style={{ width: '80%', padding: '5px' }}
          disabled={loading}
        />
        <button type="submit" disabled={loading} style={{ padding: '5px 15px', marginLeft: '10px' }}>
          {loading ? '发送中...' : '发送'}
        </button>
      </form>
    </div>
  );
}

// 图片生成组件
function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [generateImage, { loading }] = useMutation(GENERATE_IMAGE_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      const { data } = await generateImage({
        variables: {
          input: {
            prompt: prompt,
            n: 1,
            size: '1024x1024'
          }
        }
      });

      if (data.generateImage.success) {
        setImageUrls(data.generateImage.data.urls);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      alert('图片生成失败: ' + error.message);
    }
  };

  return (
    <div>
      <h3>AI Image Generator</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想生成的图片..."
          style={{ width: '80%', padding: '5px' }}
          disabled={loading}
        />
        <button type="submit" disabled={loading} style={{ padding: '5px 15px', marginLeft: '10px' }}>
          {loading ? '生成中...' : '生成图片'}
        </button>
      </form>
      <div style={{ marginTop: '20px' }}>
        {imageUrls.map((url, index) => (
          <img key={index} src={url} alt={`Generated ${index}`} style={{ maxWidth: '100%', marginTop: '10px' }} />
        ))}
      </div>
    </div>
  );
}

// 主应用组件
function App() {
  return (
    <ApolloProvider client={client}>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Koa Workers OpenAI - React Client</h1>
        <hr />
        <HealthCheck />
        <hr />
        <ChatComponent />
        <hr />
        <ImageGenerator />
      </div>
    </ApolloProvider>
  );
}

export default App;
