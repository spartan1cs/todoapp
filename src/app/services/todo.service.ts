// src/app/services/todo.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  finalize,
  tap
} from 'rxjs/operators';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  // PRIVATE BehaviorSubject holding the current list of todos
  private _todosSubject$ = new BehaviorSubject<Todo[]>([]);
  
  // Public Observable stream of todos (read-only)
  public todos$: Observable<Todo[]> = this._todosSubject$.asObservable();

  // PRIVATE BehaviorSubject tracking loading state
  private _loading$ = new BehaviorSubject<boolean>(false);
  
  // Public Observable stream of loading state
  public loading$: Observable<boolean> = this._loading$.asObservable();

  // Base URL of the REST API
  private readonly API_URL = '/api/todos';

  constructor(private http: HttpClient) { }

  /**
   * Load all to-dos from the server.
   */
  loadTodos(): void {
    // 1) indicate loading started
    this._loading$.next(true);

    // 2) issue HTTP GET
    this.http.get<Todo[]>(this.API_URL).pipe(
      // 3) use tap(...) to log or inspect
      tap((todos: Todo[]) => {
        console.log('Fetched todos from server:', todos);
      }),
      // 4) if error happens, catch it and return empty array
      catchError(err => {
        console.error('Error fetching todos:', err);
        return of([] as Todo[]);
      }),
      // 5) finalize to set loading false after success or error
      finalize(() => {
        this._loading$.next(false);
      })
    ).subscribe((todos: Todo[]) => {
      // 6) push the fetched todos into BehaviorSubject
      this._todosSubject$.next(todos);
    });
  }

  /**
   * Add a new to-do. We do an optimistic update:
   *   1) Immediately push a temp item in BehaviorSubject so UI updates.
   *   2) Then POST to server. If success, replace temp with real.
   *   3) If error, roll back (remove temp).
   */
  addTodo(title: string): void {
    // Sanitize/trim
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    // 1) read the current list
    const currentTodos = this._todosSubject$.getValue();
    // 2) create a temporary ID: max existing ID + 1, or 1 if none
    const tempId = currentTodos.length
      ? Math.max(...currentTodos.map(t => t.id)) + 1
      : 1;
    // 3) construct the temp todo
    const tempTodo: Todo = {
      id: tempId,
      title: trimmed,
      completed: false
    };

    // 4) push the temp todo into the BehaviorSubject
    this._todosSubject$.next([...currentTodos, tempTodo]);

    // 5) indicate loading state (we’re sending to server)
    this._loading$.next(true);

    // 6) HTTP POST to server
    this.http.post<Todo>(this.API_URL, { title: trimmed, completed: false }).pipe(
      tap((createdTodo: Todo) => {
        console.log('Server created todo:', createdTodo);
        // Replace tempTodo with createdTodo (server-assigned ID)
        const updatedList = this._todosSubject$
          .getValue()
          .map(t => (t.id === tempId ? createdTodo : t));
        this._todosSubject$.next(updatedList);
      }),
      catchError(err => {
        console.error('Error adding todo:', err);
        // Roll back: remove the tempTodo from the BehaviorSubject
        const rolledBack = this._todosSubject$
          .getValue()
          .filter(t => t.id !== tempId);
        this._todosSubject$.next(rolledBack);
        return of(null);
      }),
      finalize(() => {
        // Reset loading state
        this._loading$.next(false);
      })
    ).subscribe();
  }

  /**
   * Delete a to-do by ID. We do an optimistic removal from UI,
   * then send DELETE to server. On error, we could re-fetch or re-add,
   * but for simplicity we just log the error.
   */
  deleteTodo(id: number): void {
    // 1) Optimistically remove from BehaviorSubject
    const currentTodos = this._todosSubject$.getValue();
    this._todosSubject$.next(currentTodos.filter(t => t.id !== id));

    // 2) Indicate loading
    this._loading$.next(true);

    // 3) HTTP DELETE
    this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        console.log(`Deleted todo with id=${id} on server.`);
      }),
      catchError(err => {
        console.error(`Error deleting todo id=${id}:`, err);
        // (Optional) Could re-fetch all or re-add the removed item.
        return of(null);
      }),
      finalize(() => {
        // Reset loading state
        this._loading$.next(false);
      })
    ).subscribe();
  }
}
