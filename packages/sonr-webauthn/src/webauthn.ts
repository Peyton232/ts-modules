import { assertionEndpoint, authenticateUserEndpoint, makeCredentialsEndpoint, verifyAssertionEndpoint } from "./constants";
import { Action } from "./enums";
import { GetSessionState, setSessionState, State } from "./state";
import { 
    bufferDecode,
    bufferEncode,
    createAssertion,
    decodeCredentialsFromAssertion,
    encodeCredentialsForAssertion } from "./utils";

/*

*/
export function checkUserExists(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try
        {
            const sessionState: State = GetSessionState();
            if (!sessionState || !sessionState.user.name)
                resolve(false);

            fetch('/user/' + sessionState.user.name + '/exists').then(function(response) {
                resolve(true);
            }).catch(function() {
                resolve(false);
            });
        } catch(e)
        {
            console.log(`Error while validating user: ${e.message}`);
        }
    });
}

/**
*
*/
export function getCredentials(): Promise<object> {
    return new Promise<object>((resolve, reject) => {
        try {
            const sessionState: State = GetSessionState();
            fetch('/credential/' + sessionState.user.name).then(function(response) {
                console.log(response)
                resolve(response);
            }).catch(function(error) {
                console.log(`Error while resolving user credenitals for ${sessionState.user.name}`);
                reject();
            });
        } catch (e)
        {
            console.log(`Error while resolving user credentials for ${e.message}`);
        }
    });
}

/**
* @throws Error  
* @param action 
* @param name domain name to be used for credential creation
* @returns Credential
*/
export async function startRegistration(name: string): Promise<Credential | undefined> {
    const url: string = makeCredentialsEndpoint;
    const sessionState: State = GetSessionState();
    sessionState.user.name = name;
    setSessionState(sessionState);

    try {
        const response: Response | void = await fetch(url + '/' + sessionState.user.name, { method: "GET" });
        if (!response || response == null) { 
            return undefined;
        }

        const reqBody: string = await response?.text();
        const makeCredentialOptions: any = JSON.parse(reqBody);
        console.log(`Credential Creation Options: ${makeCredentialOptions}`);
        if (makeCredentialOptions.publicKey)
        {
            makeCredentialOptions.publicKey.challenge = bufferDecode(makeCredentialOptions.publicKey.challenge);
            makeCredentialOptions.publicKey.user.id = bufferDecode(makeCredentialOptions.publicKey.user.id);
        }

        if (makeCredentialOptions.publicKey.excludeCredentials) {
            for (var i = 0; i < makeCredentialOptions.publicKey.excludeCredentials.length; i++) {
                makeCredentialOptions.publicKey.excludeCredentials[i].id = bufferDecode(makeCredentialOptions.publicKey.excludeCredentials[i].id);
            }
        }
        return makeCredentialOptions.publicKey;
    } catch (e)
    {
        console.error(`Error while making user credentials: ${e.message}`);
        throw e;
    }
}

/**
* @throws Error  
* @param action 
* @param name domain name to be used for credential creation
* @returns Credential
*/
export async function startLogin(name: string): Promise<Credential | undefined> {
    const url: string = verifyAssertionEndpoint;
    const sessionState: State = GetSessionState();
    sessionState.user.name = name;
    setSessionState(sessionState);

    try {
        const response: Response | void = await fetch(url + '/' + sessionState.user.name, { method: "GET" });
        if (!response || response == null) { 
            return undefined;
        }

        const reqBody: string = await response?.text();
        const makeCredentialOptions: any = JSON.parse(reqBody);
        console.log(`Credential Creation Options: ${makeCredentialOptions}`);
        if (makeCredentialOptions.publicKey)
        {
            decodeCredentialsFromAssertion(makeCredentialOptions);
        }

        return makeCredentialOptions.publicKey;
    } catch (e)
    {
        console.error(`Error while making user credentials: ${e.message}`);
        throw e;
    }
}

/*
*
*/
export function finishRegistration(
    credential: PublicKeyCredential
    ): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            const url: string = assertionEndpoint;
            const sessionState: State = GetSessionState();
            const verificationObject: any = createAssertion(credential);
            const serializedCred: string = JSON.stringify(verificationObject);
            verificationObject && fetch(url + '/' + sessionState.user.name, {
                credentials: "same-origin",
                method: 'POST',
                body: serializedCred,
            }).then(async function(response: Response) {
                const reqBody: string = await response.text();

                if (response.status < 200 || response.status > 299)
                {
                    throw new Error(`Error while creating credential assertion: ${reqBody}`);
                }

                const makeAssertionOptions: any = JSON.parse(reqBody);
                decodeCredentialsFromAssertion(makeAssertionOptions);

                console.log(makeAssertionOptions);
                resolve(true);
            }).catch(function(err) {
                console.log(err.name);
                resolve(false);
            });
        } catch(e) {
            console.log(`Error while getting credential assertion: ${e.message}`);
            reject();
        }
    });
}

export function finishLogin(
    credential: PublicKeyCredential
    ): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            const url: string = authenticateUserEndpoint;
            const sessionState: State = GetSessionState();
            const verificationObject: any = createAssertion(credential);
            const serializedCred: string = JSON.stringify(verificationObject);
            verificationObject && fetch(url + '/' + sessionState.user.name + '.snr', {
                credentials: "same-origin",
                method: 'POST',
                body: serializedCred,
            }).then(async function(response: Response) {
                const reqBody: string = await response.text();

                if (response.status < 200 || response.status > 299)
                {
                    throw new Error(`Error while creating credential assertion: ${reqBody}`);
                }

                const makeAssertionOptions: any = JSON.parse(reqBody);
                decodeCredentialsFromAssertion(makeAssertionOptions);

                console.log(makeAssertionOptions);
                resolve(true);
            }).catch(function(err) {
                console.log(err.name);
                resolve(false);
            });
        } catch(e) {
            console.log(`Error while getting credential assertion: ${e.message}`);
            reject();
        }
    });
}

/* 
* This should be used to verify the auth data with the server
*/
export function registerNewCredential(newCredential: any) {
    // Move data into Arrays incase it is super long
    let attestationObject = new Uint8Array(newCredential.response.attestationObject);
    let clientDataJSON = new Uint8Array(newCredential.response.clientDataJSON);
    let rawId = new Uint8Array(newCredential.rawId);

    fetch(makeCredentialsEndpoint, {
        method: 'POST',
        body: JSON.stringify({
            id: newCredential.id,
            rawId: bufferEncode(rawId),
            type: newCredential.type,
            response: {
                attestationObject: bufferEncode(attestationObject),
                clientDataJSON: bufferEncode(clientDataJSON),
            },
        })
    });
};

/*
* 
*/
export function verifyAssertion(
    assertedCredential
    ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        // Move data into Arrays incase it is super long
        console.log('verifying assterted user credentials');
        const encodedAssertion: any = encodeCredentialsForAssertion(assertedCredential);
        const payload: any = createAssertion(assertedCredential);
        if (Object.keys(payload).length < 1) reject();

        fetch(assertionEndpoint, {
            method: 'POST',
            body: JSON.stringify(payload)
        }).then(() => {
            resolve(true);
        }).catch(() => {
            reject(false);
        });
    });
}