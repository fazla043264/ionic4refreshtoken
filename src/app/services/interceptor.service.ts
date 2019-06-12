import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
// import { _throw } from 'rxjs/observable/throw';
import { catchError, mergeMap, switchMap, filter, take, map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';
import { AuthenticationService } from './authentication.service';


@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private storage: Storage, private alertCtrl: AlertController, private authenticationService: AuthenticationService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    if (req.url.endsWith('/token/refresh')) {
      return next.handle(req);
    }
    
    let promise = this.storage.get('access_token');

    return from(promise).pipe(mergeMap(token => {
      const clonedReq = this.addToken(req, token);
      console.log(req);
      return next.handle(clonedReq).pipe(catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 500) {
          // console.log('executed');
          return this.handleAccessError(req, next);
        } else {
          return throwError(error.message);
        }
      })
      ) as any;
    }
    )) as any;
  }

  // Adds the token to your headers if it exists
  private addToken(request: HttpRequest<any>, token: any) {
    if (token) {
      let clone: HttpRequest<any>;
      clone = request.clone({
        setHeaders: {
          Accept: `application/json`,
          'Content-Type': `application/json`,
          Authorization: `Bearer ${token}`
        }
      });
      return clone;
    }

    return request;
  }

  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.log('Client side error', errorResponse.status);
    } else {
      console.log('Server side error', errorResponse);
    }
    return throwError(`Something went wrong , error: ${errorResponse.status} ${errorResponse.statusText}.`);
  }

  private handleAccessError(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authenticationService.getAccessTokenUsingRefreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token));
        }));

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }

}
