import React from "react";

export const useTodo = (setTodo: React.Dispatch<React.SetStateAction<ITodo[]>>) => {
    const addTodo = (name: string) => {
        setTodo((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                name,
                addedAt: new Date().toISOString(),
                isDone: false,
            },
        ]);
    };

    const removeTodo = (removeTodoId: number) => {
        setTodo((prev) => prev.filter((todo) => todo.id !== removeTodoId));
    };

    const toggleTodo = (toggleId: number) => {
        setTodo((prev) =>
            prev.map((todo) => {
                if (todo.id == toggleId) {
                    return {
                        ...todo,
                        isDone: !todo.isDone,
                    };
                }
                return todo;
            })
        );
    };

    return {
        addTodo,
        removeTodo,
        toggleTodo,
    };
};
