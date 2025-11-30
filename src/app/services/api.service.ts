import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Para Android Studio usar: 'http://10.0.2.2:8000'
  // Para navegador usar: 'http://localhost:8000'
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { 
    console.log('ApiService inicializado - URL base:', this.apiUrl);
  }

  // Métodos para usuarios
  crearUsuario(usuario: any): Observable<any> {
    console.log('ApiService: Creando usuario en', `${this.apiUrl}/usuarios/`);
    return this.http.post(`${this.apiUrl}/usuarios/`, usuario).pipe(
      catchError(this.handleError)
    );
  }

  obtenerUsuario(usuario: string): Observable<any> {
    console.log('ApiService: Obteniendo usuario', usuario, 'desde', `${this.apiUrl}/usuarios/${usuario}`);
    return this.http.get(`${this.apiUrl}/usuarios/${usuario}`).pipe(
      catchError(this.handleError)
    );
  }

  actualizarUsuario(usuario: string, datos: any): Observable<any> {
    console.log('ApiService: Actualizando usuario', usuario, 'en', `${this.apiUrl}/usuarios/${usuario}`);
    return this.http.put(`${this.apiUrl}/usuarios/${usuario}`, datos).pipe(
      catchError(this.handleError)
    );
  }

  login(credenciales: any): Observable<any> {
    console.log('ApiService: Login de usuario en', `${this.apiUrl}/login/`);
    return this.http.post(`${this.apiUrl}/login/`, credenciales).pipe(
      catchError(this.handleError)
    );
  }

  // 🔥 CORREGIR: Este método debe retornar un Observable
  eliminarUsuario(usuario: string): Observable<any> {
    console.log('ApiService: Eliminando usuario', usuario, 'desde', `${this.apiUrl}/usuarios/${usuario}`);
    return this.http.delete(`${this.apiUrl}/usuarios/${usuario}`).pipe(
      catchError(this.handleError)
    );
  }

  // 🔥 AGREGAR: Método para listar todos los usuarios (útil para debug)
  listarUsuarios(): Observable<any> {
    console.log('ApiService: Obteniendo lista de usuarios desde', `${this.apiUrl}/usuarios/`);
    return this.http.get(`${this.apiUrl}/usuarios/`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ Error detallado en ApiService:');
    console.error('- Status:', error.status);
    console.error('- Status Text:', error.statusText);
    console.error('- URL:', error.url);
    console.error('- Error object:', error.error);
    
    // Mostrar detalles específicos para errores 422
    if (error.status === 422) {
      console.error('📋 Detalles de validación:', error.error?.detail);
    }
    
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: ${error.status} - ${error.error?.detail || error.message}`;
    }
    
    console.error('Mensaje de error procesado:', errorMessage);
    return throwError(() => error);
  }
}