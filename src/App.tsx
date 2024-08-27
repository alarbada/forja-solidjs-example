import { For, createSignal } from "solid-js"
import { createMutable } from "solid-js/store"
import type { maincreateTodoOutput } from "./apiclient"
import { createApiClient } from "./apiclient"

const apiClient = createApiClient("http://localhost:3001")
type Todo = maincreateTodoOutput["todo"]

function App() {
  const state = createMutable<{
    current: string
    todos: Todo[]
    editingId: number | null
  }>({ todos: [], current: "", editingId: null })

  const [editText, setEditText] = createSignal("")

  apiClient.main.listTodos({}).then((res) => {
    if (res.error) {
      alert(res.error)
      return
    }
    state.todos = res.data.todos
  })

  const containerStyle = {
    "font-family": "Arial, sans-serif",
    "max-width": "600px",
    margin: "0 auto",
    padding: "20px",
    "background-color": "#f0f0f0",
    "border-radius": "8px",
    "box-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
  }

  const headerStyle = {
    "text-align": "center" as const,
    color: "#333",
    "margin-bottom": "20px",
  }

  const inputContainerStyle = {
    display: "flex",
    "margin-bottom": "20px",
    gap: "10px",
  }

  const inputStyle = {
    flex: "1",
    padding: "10px",
    "font-size": "16px",
    border: "1px solid #ddd",
    "border-radius": "4px",
  }

  const buttonStyle = {
    padding: "10px 20px",
    "font-size": "16px",
    "background-color": "#4CAF50",
    color: "white",
    border: "none",
    "border-radius": "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  }

  const todoItemStyle = {
    display: "flex",
    "justify-content": "space-between",
    "align-items": "center",
    padding: "10px",
    "background-color": "white",
    "border-radius": "4px",
    "margin-bottom": "10px",
    "box-shadow": "0 1px 3px rgba(0, 0, 0, 0.1)",
  }

  const todoTextStyle = {
    flex: "1",
    "margin-right": "10px",
  }

  const editInputStyle = {
    ...inputStyle,
    flex: "1",
    "margin-right": "10px",
  }

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Todo List</h1>
      <div style={inputContainerStyle}>
        <input
          type="text"
          value={state.current}
          onInput={(e) => {
            state.current = e.currentTarget.value
          }}
          style={inputStyle}
          placeholder="Enter a new todo"
        />
        <button
          onClick={async () => {
            if (!state.current.trim()) return
            const res = await apiClient.main.createTodo({ name: state.current })
            if (res.error) return
            const todo = res.data.todo
            state.todos.push(todo)
            state.current = ""
          }}
          style={buttonStyle}
        >
          Add Todo
        </button>
      </div>
      <div>
        <For each={state.todos}>
          {(todo) => {
            const isEditing = () => state.editingId === todo.id
            return (
              <div style={todoItemStyle}>
                {isEditing() ? (
                  <input
                    type="text"
                    value={editText()}
                    onInput={(e) => setEditText(e.currentTarget.value)}
                    style={editInputStyle}
                  />
                ) : (
                  <span style={todoTextStyle}>{todo.name}</span>
                )}
                <div>
                  {isEditing() ? (
                    <button
                      onClick={async () => {
                        const res = await apiClient.main.updateTodo({
                          id: todo.id,
                          name: editText(),
                        })
                        if (res.error) return
                        const updatedTodo = res.data.todo
                        const index = state.todos.findIndex(
                          (t) => t.id === updatedTodo.id
                        )
                        if (index !== -1) {
                          state.todos[index] = updatedTodo
                        }
                        state.editingId = null
                      }}
                      style={{ ...buttonStyle, "background-color": "#2196F3" }}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        state.editingId = todo.id
                        setEditText(todo.name)
                      }}
                      style={{ ...buttonStyle, "background-color": "#FFC107" }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      await apiClient.main.deleteTodo({
                        id: todo.id,
                      })
                      state.todos = state.todos.filter((t) => t.id !== todo.id)
                    }}
                    style={{
                      ...buttonStyle,
                      "background-color": "#F44336",
                      "margin-left": "5px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}

export default App
