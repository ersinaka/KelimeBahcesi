import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { authState } from '../state/authState';
import { soundManager } from '../audio/soundManager';
import { Pitir } from '../objects/Pitir';
import { CelebrationEffects } from '../utils/celebrationEffects';

export class LoginScene extends Scene {
    private pitir!: Pitir;
    private usernameInput!: HTMLInputElement;
    private codeInput!: HTMLInputElement;
    private errorTextElement!: HTMLDivElement;
    private domElement?: Phaser.GameObjects.DOMElement;

    constructor() {
        super('LoginScene');
    }

    create(): void {
        soundManager.stopSpeech();

        // Check if user is already logged in
        if (authState.isLoggedIn()) {
            this.scene.start('HubScene');
            return;
        }

        // Sky & Meadow Background
        this.add.image(270, 480, 'farm_sky_bg');

        // Drifting Clouds
        const c1 = this.add.image(120, 100, 'cloud').setScale(0.7).setAlpha(0.9);
        const c2 = this.add.image(420, 80, 'cloud').setScale(0.6).setAlpha(0.9);
        this.tweens.add({ targets: c1, x: 600, duration: 18000, repeat: -1, onRepeat: () => { c1.x = -80; } });
        this.tweens.add({ targets: c2, x: 600, duration: 15000, repeat: -1, onRepeat: () => { c2.x = -80; } });

        // Sun
        this.add.image(470, 95, 'sun').setScale(0.85);

        // Pıtır the guide character in top-left
        this.pitir = new Pitir(this, 55, 125);
        this.pitir.say(
            'Hoş geldin! Lütfen kullanıcı adını ve erişim şifreni gir!',
            'Gelişim Bahçesine hoş geldin! Giriş yaparak oyunlara erişebilirsin!'
        );

        // Center Login Card via HTML DOM element
        this.buildLoginForm();
    }

    private buildLoginForm(): void {
        const formHtml = `
        <div style="
            width: 420px;
            max-width: 94vw;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 26px;
            padding: 24px 24px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16);
            border: 3px solid #83C5BE;
            font-family: 'Fredoka', 'Quicksand', sans-serif;
            text-align: center;
            box-sizing: border-box;
        ">
            <div style="font-size: 26px; font-weight: 700; color: #2D6A4F; margin-bottom: 2px;">
                Gelişim Bahçesi 🌈
            </div>
            <div style="font-size: 14px; color: #64748B; margin-bottom: 18px;">
                Çocuk Terapi ve Eğitim Süper Uygulaması
            </div>

            <!-- Username Field -->
            <div style="text-align: left; margin-bottom: 14px;">
                <label style="display: block; font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                    👤 Kullanıcı / Çocuk Adı:
                </label>
                <input id="login-username" type="text" placeholder="Örn: Ahmet veya Profil 1" style="
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 14px;
                    border: 2px solid #CBD5E1;
                    font-size: 16px;
                    font-family: inherit;
                    box-sizing: border-box;
                    outline: none;
                    background: #F8FAFC;
                    color: #1E293B;
                " />
            </div>

            <!-- Access Code Field -->
            <div style="text-align: left; margin-bottom: 16px;">
                <label style="display: block; font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 6px;">
                    🔑 Erişim Şifresi (Varsayılan: 1234):
                </label>
                <input id="login-code" type="password" placeholder="Şifreniz (1234)" value="1234" style="
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 14px;
                    border: 2px solid #CBD5E1;
                    font-size: 16px;
                    font-family: inherit;
                    box-sizing: border-box;
                    outline: none;
                    background: #F8FAFC;
                    color: #1E293B;
                " />
            </div>

            <!-- Quick Profiles for 1-Tap Clinic Use -->
            <div style="margin-bottom: 18px; text-align: left;">
                <span style="font-size: 13px; color: #64748B; margin-right: 6px;">Hızlı Seçim:</span>
                <button type="button" class="quick-prof-btn" data-user="Ali" style="padding: 5px 10px; font-size: 13px; border-radius: 10px; border: 1px solid #CBD5E1; background: #F1F5F9; cursor: pointer; margin-right: 4px;">Ali</button>
                <button type="button" class="quick-prof-btn" data-user="Elif" style="padding: 5px 10px; font-size: 13px; border-radius: 10px; border: 1px solid #CBD5E1; background: #F1F5F9; cursor: pointer; margin-right: 4px;">Elif</button>
                <button type="button" class="quick-prof-btn" data-user="Profil 1" style="padding: 5px 10px; font-size: 13px; border-radius: 10px; border: 1px solid #CBD5E1; background: #F1F5F9; cursor: pointer;">Profil 1</button>
            </div>

            <!-- Error message container -->
            <div id="login-error" style="color: #E63946; font-size: 14px; min-height: 20px; margin-bottom: 12px; font-weight: 500;"></div>

            <!-- Submit Button -->
            <button id="login-submit-btn" style="
                width: 100%;
                padding: 14px 20px;
                border-radius: 18px;
                border: none;
                background: #52B788;
                color: #FFFFFF;
                font-size: 20px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(82, 183, 136, 0.4);
                font-family: inherit;
                transition: transform 0.1s;
            ">
                Giriş Yap ve Oyunlara Başla 🚀
            </button>
        </div>
        `;

        this.domElement = this.add.dom(270, 530).createFromHTML(formHtml);

        // Bind interactive elements
        const usernameEl = document.getElementById('login-username') as HTMLInputElement;
        const codeEl = document.getElementById('login-code') as HTMLInputElement;
        const submitBtn = document.getElementById('login-submit-btn') as HTMLButtonElement;
        const errorEl = document.getElementById('login-error') as HTMLDivElement;

        if (usernameEl) this.usernameInput = usernameEl;
        if (codeEl) this.codeInput = codeEl;
        if (errorEl) this.errorTextElement = errorEl;

        // Quick profile buttons
        const quickBtns = document.querySelectorAll('.quick-prof-btn');
        quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                soundManager.playTap();
                const target = e.currentTarget as HTMLElement;
                const user = target.getAttribute('data-user') || '';
                if (this.usernameInput) this.usernameInput.value = user;
                if (this.codeInput) this.codeInput.value = '1234';
                if (this.errorTextElement) this.errorTextElement.textContent = '';
            });
        });

        // Submit action
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.performLogin();
            });
        }

        // Enter key submits
        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.performLogin();
            }
        };
        if (this.usernameInput) this.usernameInput.addEventListener('keydown', handleEnter);
        if (this.codeInput) this.codeInput.addEventListener('keydown', handleEnter);
    }

    private performLogin(): void {
        const username = this.usernameInput ? this.usernameInput.value : '';
        const code = this.codeInput ? this.codeInput.value : '';

        const result = authState.login(username, code);

        if (!result.success) {
            soundManager.playTryAgain();
            if (this.errorTextElement) {
                this.errorTextElement.textContent = result.message || 'Giriş başarısız.';
            }
            if (this.pitir) {
                this.pitir.encourage('Şifreni veya kullanıcı adını kontrol edip tekrar dene!');
            }
        } else {
            soundManager.playSuccessBing();
            CelebrationEffects.spawnConfetti(this, 512, 384, 30);

            if (this.pitir) {
                this.pitir.celebrate(`Hoş geldin ${authState.getUsername()}! Süper Uygulamaya yönlendiriliyorsun!`);
            }

            this.time.delayedCall(800, () => {
                if (this.domElement) {
                    this.domElement.destroy();
                }
                this.scene.start('HubScene');
            });
        }
    }
}
