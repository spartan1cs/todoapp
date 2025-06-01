// src/app/components/add-todo/add-todo.component.ts

import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.css']
})
export class AddTodoComponent {
  // This @Output emits the new title string to a parent component
  @Output() newTodo = new EventEmitter<string>();

  // Two-way bound to the input box
  title: string = '';

  /**
   * Called when the user clicks “Add”. Emits the trimmed title
   * if not empty, then clears the input.
   */
  submitTodo(): void {
    const trimmed = this.title.trim();
    if (!trimmed) {
      return;
    }
    this.newTodo.emit(trimmed);
    this.title = '';
  }
}
