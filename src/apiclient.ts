export interface ApiError {
  message: string
  statusCode?: number
}
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError }

export type maincreateTodoInput = {
  name: string
}

export type maincreateTodoOutput = {
  todo: {
    id: number
    name: string
  }
}

type maincreateTodoHandler = (
  params: maincreateTodoInput
) => Promise<ApiResponse<maincreateTodoOutput>>

export type maingetTodoInput = {
  id: number
}

export type maingetTodoOutput = {
  todo: {
    id: number
    name: string
  }
}

type maingetTodoHandler = (
  params: maingetTodoInput
) => Promise<ApiResponse<maingetTodoOutput>>

export type mainupdateTodoInput = {
  id: number
  name: string
}

export type mainupdateTodoOutput = {
  todo: {
    id: number
    name: string
  }
}

type mainupdateTodoHandler = (
  params: mainupdateTodoInput
) => Promise<ApiResponse<mainupdateTodoOutput>>

export type maindeleteTodoInput = {
  id: number
}

export type maindeleteTodoOutput = {
  success: boolean
}

type maindeleteTodoHandler = (
  params: maindeleteTodoInput
) => Promise<ApiResponse<maindeleteTodoOutput>>

export type mainlistTodosInput = {}

export type mainlistTodosOutput = {
  todos: {
    id: number
    name: string
  }[]
}

type mainlistTodosHandler = (
  params: mainlistTodosInput
) => Promise<ApiResponse<mainlistTodosOutput>>

export interface ApiClient {
  main: {
    createTodo: maincreateTodoHandler
    getTodo: maingetTodoHandler
    updateTodo: mainupdateTodoHandler
    deleteTodo: maindeleteTodoHandler
    listTodos: mainlistTodosHandler
  }
}

type ApiClientConfig = {
  beforeRequest?: (config: RequestInit) => void | Promise<void>
}

export function createApiClient(
  baseUrl: string,
  config?: ApiClientConfig
): ApiClient {
  async function doFetch(path: string, params: unknown) {
    try {
      const requestConfig: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }

      if (config?.beforeRequest) {
        await config.beforeRequest(requestConfig)
      }

      const response = await fetch(`${baseUrl}/${path}`, requestConfig)
      if (!response.ok) {
        return {
          data: null,
          error: {
            message: "API request failed",
            statusCode: response.status,
          },
        }
      }
      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      }
    }
  }
  const client: ApiClient = {
    main: {
      getTodo: (params) => doFetch("main.getTodo", params),
      updateTodo: (params) => doFetch("main.updateTodo", params),
      deleteTodo: (params) => doFetch("main.deleteTodo", params),
      listTodos: (params) => doFetch("main.listTodos", params),
      createTodo: (params) => doFetch("main.createTodo", params),
    },
  }
  return client
}
