const { gql } = require('graphql-tag');

const typeDefs = gql`
  type Query {
    """
    健康检查
    """
    health: HealthStatus!

    """
    获取欢迎信息
    """
    welcome: WelcomeMessage!
  }

  type Mutation {
    """
    发送聊天消息到 OpenAI
    """
    chat(input: ChatInput!): ChatResponse!

    """
    生成文本补全
    """
    completion(prompt: String!): CompletionResponse!

    """
    生成图片
    """
    generateImage(input: ImageGenerationInput!): ImageGenerationResponse!
  }

  """
  聊天输入
  """
  input ChatInput {
    """
    聊天消息列表
    """
    messages: [MessageInput!]!

    """
    使用的模型，默认为 gpt-3.5-turbo
    """
    model: String
  }

  """
  消息输入
  """
  input MessageInput {
    """
    角色: system, user, assistant
    """
    role: String!

    """
    消息内容
    """
    content: String!
  }

  """
  图片生成输入
  """
  input ImageGenerationInput {
    """
    图片描述提示词
    """
    prompt: String!

    """
    生成图片数量，默认为 1
    """
    n: Int

    """
    图片尺寸，默认为 1024x1024
    """
    size: String
  }

  """
  聊天响应
  """
  type ChatResponse {
    success: Boolean!
    message: String!
    data: ChatData
  }

  """
  聊天数据
  """
  type ChatData {
    reply: String!
    model: String!
    timestamp: String!
  }

  """
  文本补全响应
  """
  type CompletionResponse {
    success: Boolean!
    message: String!
    data: CompletionData
  }

  """
  补全数据
  """
  type CompletionData {
    text: String!
    timestamp: String!
  }

  """
  图片生成响应
  """
  type ImageGenerationResponse {
    success: Boolean!
    message: String!
    data: ImageData
  }

  """
  图片数据
  """
  type ImageData {
    urls: [String!]!
    timestamp: String!
  }

  """
  健康状态
  """
  type HealthStatus {
    status: String!
    timestamp: String!
  }

  """
  欢迎信息
  """
  type WelcomeMessage {
    message: String!
    version: String!
  }
`;

module.exports = typeDefs;
