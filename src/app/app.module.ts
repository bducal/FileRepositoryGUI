import { NgModule } from '@angular/core';
import { BrowserModule,Title } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http"; 
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { MatTableModule } from '@angular/material/table'  
import { MatSortModule } from '@angular/material/sort';

import { MsalGuard, MsalInterceptor, MsalBroadcastService, MsalInterceptorConfiguration, MsalModule, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, MsalRedirectComponent } from '@azure/msal-angular';
import Config from "src/assets/config.json";
import { PublicClientApplication, InteractionType  } from '@azure/msal-browser';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

const protectedResources = {
  todoListApi: {
    endpoint: Config.useAuthentication=="False"?"nothing":Config.endpoint_url,  //Protect only with useAuthentication set to True in config.json, otherwise any value
    scopes: [Config.endpoint_scope],
  },
}

@NgModule({
  declarations: [
    AppComponent,
    FileExplorerComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatSortModule,
    MsalModule.forRoot( new PublicClientApplication({
      auth: {
        clientId: Config.clientId,
        authority: Config.authority,
        redirectUri: Config.redirectUri
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: isIE, // Set to true for Internet Explorer 11
      }
    }), {
      interactionType: InteractionType.Redirect, // MSAL Guard Configuration
      authRequest: {
           scopes:  [Config.api_scope] 
      }
  }, { 
    interactionType: InteractionType.Redirect, // MSAL Interceptor Configuration
    protectedResourceMap: new Map([ 
        ['https://graph.microsoft.com/v1.0/me', ['user.read']]
        ,[protectedResources.todoListApi.endpoint, protectedResources.todoListApi.scopes]
    ])
  })
  ],
  providers: [Title,{
    provide: HTTP_INTERCEPTORS,
    useClass: MsalInterceptor,
    multi: true
  },
  MsalGuard],
  bootstrap: [AppComponent, MsalRedirectComponent,FileExplorerComponent]
})
export class AppModule { }
