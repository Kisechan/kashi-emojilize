/**
 * Cloudflare Worker 入口点
 *
 * 这是一个 emoji 增强的后端 API 网关
 * 接收前端请求，调用 DeepSeek API 进行文本 emoji 增强处理
 *
 * - 运行 `npm run dev` 启动开发服务器
 * - 访问 http://localhost:8787/enhance 查看效果
 * - 运行 `npm run deploy` 发布 Worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Env, EnhanceResponse, AppError } from './types/index';
import { handleEnhanceRequest } from './handlers/enhance';

/**
 * 响应错误请求
 */
function createErrorResponse(
  message: string,
  statusCode: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

/**
 * 响应成功请求
 */
function createSuccessResponse(data: EnhanceResponse): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * 处理 OPTIONS 请求（CORS 预检）
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * 处理 POST /enhance 请求
 */
async function handleEnhanceRoute(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // 解析请求体
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      return createErrorResponse('请求体必须是有效的 JSON', 400);
    }

    // 调用业务处理器
    const response = await handleEnhanceRequest(body, env);

    // 返回结果
    return createSuccessResponse(response);
  } catch (error) {
    console.error('处理 /enhance 请求时出错:', error);
    return createErrorResponse('服务器内部错误', 500);
  }
}

/**
 * 处理健康检查
 */
function handleHealth(): Response {
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'emoji-enhance-worker',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // 处理 CORS 预检请求
    if (method === 'OPTIONS') {
      return handleOptions();
    }

    // 路由分配
    if (pathname === '/health' || pathname === '/') {
      // 健康检查端点
      if (method === 'GET') {
        return handleHealth();
      }
      return createErrorResponse('方法不允许', 405);
    }

    if (pathname === '/enhance') {
      // emoji 增强端点
      if (method === 'POST') {
        return await handleEnhanceRoute(request, env);
      }
      return createErrorResponse('方法不允许', 405);
    }

    // 处理未找到的路由
    return createErrorResponse('Not Found', 404);
  },
} satisfies ExportedHandler<Env>;
