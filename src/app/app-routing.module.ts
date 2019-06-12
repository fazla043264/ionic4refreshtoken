import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  {
    path: 'members',
    loadChildren: '../app/members/members.module#MembersPageModule' ,
    canActivate : [AuthGuardService]
  },
  // {
  //   path: 'menu',
  //   loadChildren: './members/menu/menu.module#MenuPageModule',
  //   canActivate:[AuthGuardService]
  // }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
