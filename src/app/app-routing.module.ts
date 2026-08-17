import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pozajmice',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.module').then(m => m.AuthPageModule)
  },
  {
    path: 'pozajmice',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/pozajmice/pozajmice.module').then(m => m.PozajmicePageModule)
  },
  {
    path: 'statistika',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/statistika/statistika.module').then(m => m.StatistikaPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}