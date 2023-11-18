import React, { useState } from "react";
import { useTodo } from "../hooks/useTodo";

interface TodoProps {
    children?: React.ReactNode;
}

const TodoApp: React.FC<TodoProps> = () => {
    const [todos, setTodos] = useState<ITodo[]>([
        {
            id: 1,
            addedAt: new Date().toISOString(),
            isDone: true,
            name: "test"
        },
        {
            id: 2,
            addedAt: new Date().toISOString(),
            isDone: true,
            name: "test 2"
        }
    ]);
    const { toggleTodo } = useTodo(setTodos);
    return (
        <>
            <div className="todo-list">
                {todos.map((todo) => {
                    return <SingleTodo key={todo.id} todo={todo} toggle={toggleTodo} />;
                })}
            </div>
        </>
    );
};
export default TodoApp;

const SingleTodo: React.FC<{ todo: ITodo; toggle: (id: number) => void }> = ({ todo, toggle }) => {
    return (
        <div className="todo">
            <span>{todo.name}</span>
            <input
                type="checkbox"
                checked={todo.isDone}
                onChange={() => {
                    toggle(todo.id);
                }}
            />
        </div>
    );
};
