import { createCredentials } from "./credentials";
import { ConfigurationOptions } from "./types/Options";
import { WebAuthn } from "./webauthn";
import { Result, Status } from "./types/Result";
import { SessionState } from "./state";

/**
 * 
 * @param options configuration object for webAuthentication options
 * @returns PublicKeyCredential
 */
export async function startUserRegistration(options: ConfigurationOptions): Promise<PublicKeyCredential> {
    if (!options)
        throw Error("No Configuration options provided, aborting");

    try
    {
        const authn: WebAuthn = new WebAuthn(options);

        let sessionState: SessionState = new SessionState();
        sessionState.UserName = options.name;
        sessionState.DisplayName = options.name;

        authn.WithSessionState(sessionState);

        const credential: Result<PublicKeyCredentialCreationOptions> = await authn.StartRegistration();
        options?.registrationHooks?.afterStart();
        const newCredential: Credential | void = await createCredentials(
            credential as unknown as PublicKeyCredentialCreationOptions
        );
        
        console.info(`Credentials created for ${options.name}`);
        console.log(newCredential);
        authn.SessionState.Credential = newCredential as PublicKeyCredential;
        const resp: Result<Credential> = await authn.FinishRegistration();
        options?.registrationHooks?.afterFinish();
    
        return resp.result as PublicKeyCredential;

    } catch(e)
    {
        console.error(`Error while registering endpoint: ${e}`);
        throw e;
    }
}