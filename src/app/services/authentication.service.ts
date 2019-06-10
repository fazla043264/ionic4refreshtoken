import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, throwError, Observable, from, of } from 'rxjs';
import { Platform, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap, catchError, mergeMap, map, switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(
    private http: HttpClient,
    private helper: JwtHelperService,
    private storage: Storage,
    private platform: Platform,
    private alertController: AlertController) {
    this.platform.ready().then(() => {
      this.checkToken();
    });
  }
  url = 'http://localhost:5000'; // 'https://shopping-rest-api.herokuapp.com';
  ACCESS_TOKEN = 'access_token';
  REFRESH_TOKEN = 'refresh_token';
  user = null;
  token;
  // refreshToken;
  authenticationState = new BehaviorSubject(false);


  login(data) {
    return this.http.post(`${this.url}/auth`, data)
      .pipe(
        tap(res => {

          this.storage.set(this.ACCESS_TOKEN, res[this.ACCESS_TOKEN]);
          this.storage.set(this.REFRESH_TOKEN, res[this.REFRESH_TOKEN]);
          this.user = this.helper.decodeToken(res[this.ACCESS_TOKEN]);
          // this.storage.get(this.REFRESH_TOKEN);
          // console.log(this.storage.get(this.ACCESS_TOKEN));
          // console.log(this.getRefreshToken());
          this.authenticationState.next(true);
        }),
      );
  }

  logout() {
    this.storage.remove(this.ACCESS_TOKEN).then(() => {
      this.authenticationState.next(false);
    });
    this.storage.remove(this.REFRESH_TOKEN);
  }


  private addToken(token: any) {
    if (token) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        })
      };
      return httpOptions;
    }
  }
  // You might need some additional rxjs logic then. 
  // When you receive an unauthorised, you could automatically start a new HTTP call 
  // to get the token, store it, and then retry the initial call!

  async getAccessTokenUsingRefreshToken() {
    const refreshToken = await this.storage.get('refresh_token');
    console.log(refreshToken);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      })
    };
    return this.http.post<any>(`${this.url}/token/refresh`, 'body', httpOptions).pipe(switchMap(tokens => {
      // console.log(tokens['access_token']);
      let category = tokens.category;
      console.log(category);
      // this.storage.set(this.ACCESS_TOKEN, tokens[this.ACCESS_TOKEN]);
      // console.log(this.storage.get('access_token'));
      return of(tokens); // if not working try this "return of(tokens);"

    }),
      catchError(catchError(() => {
        return of({});
      })));

  }



  checkToken(): Promise<any> {
    return this.storage.get(this.ACCESS_TOKEN).then(token => {
      if (token) {
        this.token = token;

        if (!this.helper.isTokenExpired(this.token)) {
          this.user = this.helper.decodeToken(this.token);
          this.authenticationState.next(true);
        } else {
          this.storage.remove(this.ACCESS_TOKEN);
          this.storage.remove(this.REFRESH_TOKEN);
        }
      }
    });
  }

  getToken() {
    return this.storage.get(this.ACCESS_TOKEN);
  }
  isAuthenticated() {
    return this.authenticationState.value;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

  // showAlert(msg) {
  //   let alert = this.alertController.create({
  //     message: msg,
  //     header: 'Error',
  //     buttons: ['OK']
  //   });
  //   alert.then(a => a.present());
  // }

}

