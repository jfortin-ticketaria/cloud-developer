import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const todosAccess = new TodosAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todosAccess.getTodos(userId);
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {

    const itemId = uuid.v4()
    return await todosAccess.createTodo({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false
    })
}

export function generateUploadUrl(todoId: string) {
    return todosAccess.generateUploadUrl(todoId);
}

export async function deleteTodo(todoId: string, userId: string) : Promise<void> {
    await todosAccess.deleteTodo(todoId, userId);
}

export async function updateTodoUrl(url : string, todoId: string, userId: string) : Promise<void> {
    await todosAccess.updateTodoUrl(url, todoId, userId);
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    userId: string
): Promise<void> {
    return await todosAccess.updateTodo(todoId, userId, updateTodoRequest)
}
