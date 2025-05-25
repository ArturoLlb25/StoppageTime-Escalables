import { HttpInterceptorFn } from "@angular/common/http";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { environment } from "../../environments/environment";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // No interceptamos las peticiones a la API de fútbol
  if (req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  
  // Añadimos el token a las peticiones a nuestro backend
  const token = authService.getToken();
  
  if (token && req.url.startsWith(environment.backendUrl)) {
    // Siempre usar formato Bearer para el token
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }
  
  return next(req);
};