"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type LanguageCode = "en" | "es" | "fr" | "it" | "de" | "pt" | "ja" | "ko" | "zh"

const emailTranslations = {
  en: {
    title: "Reset your password",
    message: "Click the button below to set a new password for your account.",
    button: "Reset Password",
    footer: "If you didn't request a password reset, please ignore this email.",
    expired: "This link has expired. Please request a new password reset.",
    back_to_login: "Back to login",
  },
  es: {
    title: "Restablecer tu contraseña",
    message: "Haz clic en el botón de abajo para establecer una nueva contraseña para tu cuenta.",
    button: "Restablecer contraseña",
    footer: "Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo electrónico.",
    expired: "Este enlace ha expirado. Por favor solicita un nuevo restablecimiento de contraseña.",
    back_to_login: "Volver al inicio de sesión",
  },
  fr: {
    title: "Réinitialiser votre mot de passe",
    message: "Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe pour votre compte.",
    button: "Réinitialiser le mot de passe",
    footer: "Si vous n'avez pas demandé une réinitialisation de mot de passe, veuillez ignorer cet e-mail.",
    expired: "Ce lien a expiré. Veuillez demander une nouvelle réinitialisation de mot de passe.",
    back_to_login: "Retour à la connexion",
  },
  it: {
    title: "Reimposta la tua password",
    message: "Fai clic sul pulsante sottostante per impostare una nuova password per il tuo account.",
    button: "Reimposta password",
    footer: "Se non hai richiesto una reimpostazione della password, ignora questo email.",
    expired: "Questo link è scaduto. Per favore richiedi una nuova reimpostazione della password.",
    back_to_login: "Torna al login",
  },
  de: {
    title: "Passwort zurücksetzen",
    message: "Klicken Sie auf die Schaltfläche unten, um ein neues Passwort für Ihr Konto festzulegen.",
    button: "Passwort zurücksetzen",
    footer: "Wenn Sie keine Passwort-Zurücksetzen angefordert haben, bitte ignorieren Sie diese E-Mail.",
    expired: "Dieser Link ist abgelaufen. Bitte fordern Sie eine neue Passwort-Zurücksetzen an.",
    back_to_login: "Zurück zur Anmeldung",
  },
  pt: {
    title: "Redefina sua senha",
    message: "Clique no botão abaixo para definir uma nova senha para sua conta.",
    button: "Redefinir senha",
    footer: "Se você não solicitou uma redefinição de senha, ignore este e-mail.",
    expired: "Este link expirou. Por favor, solicite uma nova redefinição de senha.",
    back_to_login: "Voltar para o login",
  },
  ja: {
    title: "パスワードをリセットしてください",
    message: "下のボタンをクリックして、アカウントの新しいパスワードを設定してください。",
    button: "パスワードをリセット",
    footer: "パスワードリセットをリクエストしていない場合は、このメールを無視してください。",
    expired: "このリンクは期限切れです。新しいパスワードリセットをリクエストしてください。",
    back_to_login: "ログインに戻る",
  },
  ko: {
    title: "비밀번호 재설정",
    message: "아래 버튼을 클릭하여 계정의 새 비밀번호를 설정하세요.",
    button: "비밀번호 재설정",
    footer: "비밀번호 재설정을 요청하지 않았다면 이 이메일을 무시하세요.",
    expired: "이 링크가 만료되었습니다. 새 비밀번호 재설정을 요청하세요.",
    back_to_login: "로그인으로 돌아가기",
  },
  zh: {
    title: "重置您的密码",
    message: "点击下方按钮为您的账户设置新密码。",
    button: "重置密码",
    footer: "如果您未请求密码重置，请忽略此电子邮件。",
    expired: "此链接已过期。请请求新的密码重置。",
    back_to_login: "返回登录",
  },
}

type EmailTranslationsType = typeof emailTranslations

interface ResetPageProps {
  searchParams: {
    token?: string
    email?: string
    lang?: string
  }
}

export default function ResetPage({ searchParams }: ResetPageProps) {
  const lang = (searchParams.lang || "en") as LanguageCode
  const token = searchParams.token
  const router = useRouter()

  const t = emailTranslations[lang as keyof EmailTranslationsType] || emailTranslations.en

  const handleReset = () => {
    if (token) {
      router.push(`/auth/reset-password?token=${token}&lang=${lang}`)
    }
  }

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{t.title}</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 480px;
            width: 100%;
            padding: 40px;
            text-align: center;
          }
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
          }
          h1 {
            font-size: 28px;
            color: #1a1a1a;
            margin-bottom: 16px;
            font-weight: 700;
          }
          .message {
            font-size: 16px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 32px;
          }
          .button-container {
            margin-bottom: 32px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            border: none;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          }
          .footer {
            font-size: 13px;
            color: #999;
            line-height: 1.6;
            border-top: 1px solid #eee;
            padding-top: 24px;
            margin-top: 24px;
          }
          .error {
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }
          .back-link {
            margin-top: 24px;
            font-size: 14px;
          }
          .back-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
          }
          .back-link a:hover {
            text-decoration: underline;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="logo">🔑</div>
          <h1>{t.title}</h1>
          
          {token ? (
            <>
              <p className="message">{t.message}</p>
              <div className="button-container">
                <button onClick={handleReset} className="button">{t.button}</button>
              </div>
            </>
          ) : (
            <div className="error">{t.expired}</div>
          )}
          
          <p className="footer">{t.footer}</p>
          
          <div className="back-link">
            <a href="/login">{t.back_to_login}</a>
          </div>
        </div>
      </body>
    </html>
  )
}
