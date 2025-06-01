// src/app/components/todo-list/todo-list.component.ts

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
  // Observables exposed from the service
  todos$!: Observable<Todo[]>;
  loading$!: Observable<boolean>;

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    // Bind to the service’s public Observable streams
    this.todos$ = this.todoService.todos$;
    this.loading$ = this.todoService.loading$;

    // Kick off initial load
    this.todoService.loadTodos();
  }

  /**
   * Called when <app-add-todo> emits a new to-do title
   */
  onAddTodo(title: string): void {
    this.todoService.addTodo(title);
  }

  /**
   * Called when user clicks “Delete” on a to-do item
   */
  onDelete(id: number): void {
    this.todoService.deleteTodo(id);
  }

  /**
   * Called when user edits a to-do item
   */
  onEdit(event: { id: number, title: string }) {
    this.todoService.editTodo(event.id, event.title);
  }
}
