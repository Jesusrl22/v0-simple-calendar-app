import { Suspense } from "react"
import { translations } from "@/lib/translations"

type LanguageCode = keyof typeof translations

const emailTranslations = {
  en: {
    title: "Confirm your email address",
    message: "Thank you for signing up! Please confirm your email address to get started.",
    button: "Confirm Email",
    footer: "If you didn't create this account, please ignore this email.",
    expired: "This link has expired. Please request a new confirmation email.",
  },
  es: {
    title: "Confirma tu dirección de correo electrónico",
    message: "¡Gracias por registrarte! Por favor, confirma tu dirección de correo electrónico para comenzar.",
    button: "Confirmar correo electrónico",
    footer: "Si no creaste esta cuenta, por favor ignora este correo electrónico.",
    expired: "Este enlace ha expirado. Por favor solicita un nuevo correo de confirmación.",
  },
  fr: {
    title: "Confirmez votre adresse e-mail",
    message: "Merci de vous être inscrit ! Veuillez confirmer votre adresse e-mail pour commencer.",
    button: "Confirmer l'e-mail",
    footer: "Si vous n'avez pas créé ce compte, veuillez ignorer cet e-mail.",
    expired: "Ce lien a expiré. Veuillez demander un nouvel e-mail de confirmation.",
  },
  it: {
    title: "Conferma il tuo indirizzo email",
    message: "Grazie per esserti iscritto! Per favore, conferma il tuo indirizzo email per iniziare.",
    button: "Conferma email",
    footer: "Se non hai creato questo account, ignora questo email.",
    expired: "Questo link è scaduto. Per favore richiedi una nuova email di conferma.",
  },
  de: {
    title: "Bestätigen Sie Ihre E-Mail-Adresse",
    message: "Danke für die Anmeldung! Bitte bestätigen Sie Ihre E-Mail-Adresse, um zu beginnen.",
    button: "E-Mail bestätigen",
    footer: "Wenn Sie dieses Konto nicht erstellt haben, bitte ignorieren Sie diese E-Mail.",
    expired: "Dieser Link ist abgelaufen. Bitte fordern Sie eine neue Bestätigungs-E-Mail an.",
  },
  pt: {
    title: "Confirme seu endereço de e-mail",
    message: "Obrigado por se inscrever! Por favor, confirme seu endereço de e-mail para começar.",
    button: "Confirmar e-mail",
    footer: "Se você não criou esta conta, ignore este e-mail.",
    expired: "Este link expirou. Por favor, solicite um novo e-mail de confirmação.",
  },
  ja: {
    title: "メールアドレスを確認してください",
    message: "登録していただきありがとうございます!メールアドレスを確認してください。",
    button: "メールを確認",
    footer: "このアカウントを作成していない場合は、このメールを無視してください。",
    expired: "このリンクは期限切れです。新しい確認メールをリクエストしてください。",
  },
  ko: {
    title: "이메일 주소 확인",
    message: "가입해주셔서 감사합니다! 시작하려면 이메일 주소를 확인하세요.",
    button: "이메일 확인",
    footer: "이 계정을 만들지 않았다면 이 이메일을 무시하십시오.",
    expired: "이 링크가 만료되었습니다. 새 확인 이메일을 요청하세요.",
  },
  zh: {
    title: "确认您的电子邮件地址",
    message: "感谢您的注册!请确认您的电子邮件地址以开始使用。",
    button: "确认电子邮件",
    footer: "如果您未创建此账户，请忽略此电子邮件。",
    expired: "此链接已过期。请请求新的确认电子邮件。",
  },
}

type EmailTranslationsType = typeof emailTranslations

interface ConfirmPageProps {
  searchParams: {
    token?: string
    email?: string
    lang?: string
  }
}

export default function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const lang = (searchParams.lang || "en") as LanguageCode
  const email = searchParams.email
  const token = searchParams.token

  const t = emailTranslations[lang as keyof EmailTranslationsType] || emailTranslations.en

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
          .success {
            background: #efe;
            border: 1px solid #cfc;
            color: #3c3;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="logo">✓</div>
          <h1>{t.title}</h1>
          
          {token ? (
            <>
              <p className="message">{t.message}</p>
              <div className="button-container">
                <form method="post" action={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify`}>
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="type" value="signup" />
                  <input type="hidden" name="redirect_to" value={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?lang=${lang}`} />
                  <button type="submit" className="button">{t.button}</button>
                </form>
              </div>
            </>
          ) : (
            <div className="error">{t.expired}</div>
          )}
          
          <p className="footer">{t.footer}</p>
        </div>
      </body>
    </html>
  )
}
