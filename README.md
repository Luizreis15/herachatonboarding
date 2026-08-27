# Digital Hera Onboard

Onboarding de clientes da Digital Hera para configuração do HeraChat.

## Fluxo

1. A equipe acessa `/admin`, cadastra a empresa e gera o link.
2. O responsável abre `/:token` e preenche o cadastro.
3. A submissão aparece em `/admin/submissions`.

## Desenvolvimento

```sh
npm i
npm run dev
```

Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env.local`.
