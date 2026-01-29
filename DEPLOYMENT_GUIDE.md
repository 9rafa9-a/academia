# 🚀 Guia de Deploy: Firebase + Vercel

Este guia vai te ajudar a colocar o **Gym Tracker** no ar com banco de dados real.

## Parte 1: Configurar o Firebase (Banco de Dados)

1.  Acesse [console.firebase.google.com](https://console.firebase.google.com/) e faça login com seu Google.
2.  Clique em **"Criar um projeto"** (ou "Add project").
    *   Nome: `gym-tracker` (ou o que preferir).
    *   Google Analytics: Pode desativar para ser mais rápido.
3.  No painel do projeto, menu lateral esquerdo, vá em **Build** -> **Firestore Database**.
4.  Clique em **Create Database**.
    *   Escolha a location (ex: `nam5 (us-central)` ou `sao-paulo` se disponível).
    *   **Importante**: Escolha iniciar em **Test Mode** (Modo de teste) por enquanto. (Isso permite leitura/escrita por 30 dias sem regras complexas).
5.  Agora vamos pegar as chaves.
    *   Clique na engrenagem ⚙️ (Project Overview) -> **Project settings**.
    *   Role até o final da página em "Your apps".
    *   Clique no ícone **</> (Web)**.
    *   Dê um nome (ex: `gym-web`) e registre.
    *   Vai aparecer um bloco de código `const firebaseConfig = { ... }`.
    *   **COPIE** os valores dessas chaves. Vamos precisar delas na Vercel:
        *   `apiKey`
        *   `authDomain`
        *   `projectId`
        *   `storageBucket`
        *   `messagingSenderId`
        *   `appId`

## Parte 2: Deploy na Vercel (Hospedagem)

1.  Acesse [vercel.com](https://vercel.com/) e faça login (pode ser com GitHub).
2.  Clique em **"Add New..."** -> **Project**.
3.  Importe o repositório do GitHub onde este código está (se ainda não subiu, suba agora!).
    *   *Se você não tem o código no GitHub ainda:*
        1.  Crie um repo no GitHub.
        2.  Rode no terminal do VS Code:
            ```bash
            git init
            git add .
            git commit -m "Initial commit"
            git branch -M main
            git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
            git push -u origin main
            ```
4.  Na tela de configuração da Vercel ("Configure Project"):
    *   Em **Environment Variables**, adicione as chaves que você copiou do Firebase:

    | NAME | VALUE (Cole o valor do Firebase) |
    | :--- | :--- |
    | `NEXT_PUBLIC_FIREBASE_API_KEY` | (sua apiKey) |
    | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (seu authDomain) |
    | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (seu projectId) |
    | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | (seu storageBucket) |
    | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (seu messagingSenderId) |
    | `NEXT_PUBLIC_FIREBASE_APP_ID` | (seu appId) |

5.  Clique em **Deploy**.

## Pronto! 🎉
Aguarde uns minutos. A Vercel vai te dar um link (ex: `gym-tracker.vercel.app`).
Ao abrir pela primeira vez, o sistema vai verificar que o banco está vazio e vai **automaticamente criar** os treinos do Rafael e da Julyana lá.
