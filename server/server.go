package main

import (
	"os"

	"github.com/alarbada/forja"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Todo struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

var todos []Todo
var nextID int = 1

type createTodoInput struct {
	Name string `json:"name"`
}

type createTodoOutput struct {
	Todo Todo `json:"todo"`
}

func createTodo(e echo.Context, input *createTodoInput) (*createTodoOutput, error) {
	todo := Todo{
		ID:   nextID,
		Name: input.Name,
	}
	nextID++
	todos = append(todos, todo)
	return &createTodoOutput{Todo: todo}, nil
}

type getTodoInput struct {
	ID int `json:"id"`
}

type getTodoOutput struct {
	Todo Todo `json:"todo"`
}

func getTodo(e echo.Context, input *getTodoInput) (*getTodoOutput, error) {
	for _, todo := range todos {
		if todo.ID == input.ID {
			return &getTodoOutput{Todo: todo}, nil
		}
	}
	return nil, echo.NewHTTPError(404, "Todo not found")
}

type updateTodoInput struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type updateTodoOutput struct {
	Todo Todo `json:"todo"`
}

func updateTodo(e echo.Context, input *updateTodoInput) (*updateTodoOutput, error) {
	for i, todo := range todos {
		if todo.ID == input.ID {
			todos[i].Name = input.Name
			return &updateTodoOutput{Todo: todos[i]}, nil
		}
	}
	return nil, echo.NewHTTPError(404, "Todo not found")
}

type deleteTodoInput struct {
	ID int `json:"id"`
}

type deleteTodoOutput struct {
	Success bool `json:"success"`
}

func deleteTodo(e echo.Context, input *deleteTodoInput) (*deleteTodoOutput, error) {
	for i, todo := range todos {
		if todo.ID == input.ID {
			todos = append(todos[:i], todos[i+1:]...)
			return &deleteTodoOutput{Success: true}, nil
		}
	}
	return nil, echo.NewHTTPError(404, "Todo not found")
}

type listTodosInput struct{}

type listTodosOutput struct {
	Todos []Todo `json:"todos"`
}

func listTodos(e echo.Context, input *listTodosInput) (*listTodosOutput, error) {
	return &listTodosOutput{Todos: todos}, nil
}

func main() {
	e := echo.New()
	e.Use(middleware.CORS())
	handlers := forja.NewTypedHandlers(e)
	forja.AddHandler(handlers, createTodo)
	forja.AddHandler(handlers, getTodo)
	forja.AddHandler(handlers, updateTodo)
	forja.AddHandler(handlers, deleteTodo)
	forja.AddHandler(handlers, listTodos)
	codegen := []byte(handlers.GenerateTypescriptClient())
	if err := os.WriteFile("./src/apiclient.ts", codegen, 0644); err != nil {
		panic(err)
	}
	e.Logger.Fatal(e.Start(":3001"))
}
