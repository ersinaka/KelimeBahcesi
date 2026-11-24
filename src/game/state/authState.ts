export interface UserSession {
    username: string;
    accessCode: string;
    loginTime: number;
}

const AUTH_STORAGE_KEY = 'kelime_bahcesi_auth_session_v1';
const VALID_CODES_KEY = 'kelime_bahcesi_valid_codes_v1';

const DEFAULT_CODES = ['1234', 'TERAPI', 'KELIME', '2026', '0000'];

export class AuthStateManager {
    private static instance: AuthStateManager;
    private currentSession: UserSession | null = null;
    private validCodes: string[] = [...DEFAULT_CODES];

    private constructor() {
        this.loadSession();
    }

    public static getInstance(): AuthStateManager {
        if (!AuthStateManager.instance) {
            AuthStateManager.instance = new AuthStateManager();
        }
        return AuthStateManager.instance;
    }

    private loadSession(): void {
        try {
            const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
            if (rawSession) {
                this.currentSession = JSON.parse(rawSession);
            }

            const rawCodes = localStorage.getItem(VALID_CODES_KEY);
            if (rawCodes) {
                this.validCodes = JSON.parse(rawCodes);
            }
        } catch (e) {
            console.warn('Could not load auth session:', e);
        }
    }

    public isLoggedIn(): boolean {
        return this.currentSession !== null && !!this.currentSession.username;
    }

    public getUsername(): string {
        return this.currentSession?.username || 'Misafir';
    }

    public validateCode(code: string): boolean {
        if (!code) return false;
        const normalized = code.trim().toUpperCase();
        // Accepts any code in the therapist valid codes list or default list
        return this.validCodes.includes(normalized) || normalized === '1234';
    }

    public login(username: string, accessCode: string): { success: boolean; message?: string } {
        const cleanUser = username.trim();
        const cleanCode = accessCode.trim().toUpperCase();

        if (!cleanUser) {
            return { success: false, message: 'Lütfen kullanıcı adınızı girin.' };
        }

        if (!this.validateCode(cleanCode)) {
            return { success: false, message: 'Geçersiz erişim şifresi! (Varsayılan: 1234)' };
        }

        this.currentSession = {
            username: cleanUser,
            accessCode: cleanCode,
            loginTime: Date.now()
        };

        try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
        } catch {
            // localStorage policy fallback
        }

        return { success: true };
    }

    public logout(): void {
        this.currentSession = null;
        try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch {
            // ignore
        }
    }
}

export const authState = AuthStateManager.getInstance();
