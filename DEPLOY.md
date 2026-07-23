# G FIT TIME — Deploy na Vercel

## 1. Variáveis de ambiente

No painel da Vercel, em **Settings → Environment Variables**, adicione as duas
abaixo (marque os três ambientes: Production, Preview, Development):

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://spphuknbndvysrufvpoq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_KNLkt6MP0sgX4n1m_JQCSg_SypCpwEO` |

> As duas são públicas por design (rodam no navegador). O `.env.local` **não**
> vai para o repositório — o `.gitignore` já cobre `.env*`.

## 2. Subir o código

O projeto ainda não é um repositório git. Dois caminhos:

**A. GitHub → Vercel (recomendado, faz deploy a cada push)**

```bash
git init
git add .
git commit -m "G FIT TIME"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/gfit-time.git
git push -u origin main
```

Depois, na Vercel: **Add New → Project → Import** o repositório. Ela detecta
Next.js sozinha (build `next build`, sem configuração extra).

**B. Vercel CLI (deploy direto da pasta, sem GitHub)**

```bash
npx vercel
```

## 3. Depois do deploy

A Vercel devolve uma URL (ex.: `gfit-time.vercel.app`). Use assim na academia:

| Tela | Endereço |
|---|---|
| Painel (notebook) | `.../painel` |
| Tela da TV | `.../tv` |
| Controle (celular) | `.../painel/controle` → escolher o treino |

Como o Supabase é nuvem, TV e celular sincronizam de qualquer lugar — não
precisam estar na mesma rede.

## Observações

- **Sem autenticação:** qualquer pessoa com o endereço opera o sistema. Decisão
  consciente (uso interno). Se um dia for necessário, dá para adicionar um gate.
- **Storage dos patrocinadores** já é público no Supabase; nada a configurar.
- Para rodar localmente: `npm run dev` (a rede local também acessa pelo IP que
  o terminal mostra em "Network").
