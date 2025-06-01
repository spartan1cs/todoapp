
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../../models/todo.model';
@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.css'
})
export class TodoItemComponent {
/** 
   * 1) The parent “binds” a Todo object into this property.
   * 2) Use the `!` because Angular will definitely assign it.
   */
  @Input() todo!: Todo;

  /**
   * When the parent wants to know “delete was clicked,”
   * we emit the ID via this `@Output`. 
   */
  @Output() delete = new EventEmitter<number>();

  onDelete() {
    this.delete.emit(this.todo.id);
  }
}