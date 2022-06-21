import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, InteractionType, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { FileExplorerComponent } from 'src/app/file-explorer/file-explorer.component';
import { EventMessage, EventType } from '@azure/msal-browser';
import Config from "src/assets/config.json";
import { Title } from '@angular/platform-browser';

//Nice tutorial: https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-angular-auth-code

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  ConfigTitle = Config.Title
  title = this.ConfigTitle;
  useAuthentication = Config.useAuthentication;

  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();

  constructor(@Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration, private broadcastService: MsalBroadcastService, private authService: MsalService, private fec: FileExplorerComponent, private titleService: Title) { }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
    this.titleService.setTitle(this.ConfigTitle);
      this.broadcastService.inProgress$
        .pipe(
          filter((status: InteractionStatus) => status === InteractionStatus.None),
          takeUntil(this._destroying$)
        )
        .subscribe(() => {
          this.setLoginDisplay();
        })

      this.broadcastService.msalSubject$
        .pipe(
          filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS),
          takeUntil(this._destroying$)
        )
        .subscribe((result: EventMessage) => {
          console.log(result);
        });
  }

  login() {
    if (this.msalGuardConfig.authRequest) {
      this.authService.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
        .subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
          console.log(response);
          this.setLoginDisplay();
          window.location.reload();
        });
    } else {
      this.authService.loginPopup()
        .subscribe({
          next: (result) => {
            console.log(result);
            this.setLoginDisplay();
            window.location.reload();
          },
          error: (error) => console.log(error)
        });
    }
  }

  logout() {
    this.authService.logoutPopup({
      mainWindowRedirectUri: "/"
    }).subscribe({
      next: (result) => {
        this.username = "";
        localStorage.removeItem('username');
        this.setLoginDisplay();
        //window.location.reload();
      },
      error: (error) => console.log(error)
    });
  }

  username: string = "";

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    if (this.authService.instance.getAllAccounts().length > 0) {
      this.username = this.authService.instance.getAllAccounts()[0].username;
      localStorage.setItem('username', this.username);
    }
    else {
      this.username = "";
      localStorage.removeItem('username');
    }
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}