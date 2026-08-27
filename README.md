# Digital Hera Onboard

Crie somente o FRONT-END de um sistema de onboarding de clientes da Digital Hera.

O objetivo desta entrega é construir toda a identidade visual, experiência, componentes, navegação e responsividade. Não implemente banco de dados, Supabase, autenticação real, APIs, Edge Functions ou qualquer backend. Use apenas estado local React e dados mockados quando necessário.

O projeto será posteriormente clonado e integrado ao backend fora do Lovable.

1. Objetivo do produto

O cliente da Digital Hera receberá um link individual para preencher os dados necessários para configuração do HeraChat, plataforma de atendimento via WhatsApp.

O fluxo principal deve ser:

Link do cliente → Formulário → Revisão → Sucesso

Também deve existir uma interface administrativa para visualizar como serão organizadas as submissões.

2. Rotas

Prepare estas rotas:

/
Landing simples informando que o onboarding deve ser acessado pelo link enviado pela Digital Hera.

/:token
Formulário de onboarding do cliente.

Não validar o token em backend nesta versão. Apenas capturar o parâmetro da URL e renderizar normalmente o onboarding.

/admin/login
Tela visual de login administrativo, sem autenticação real.

/admin
Lista mockada de submissões.

/admin/submissions/:id
Detalhes de uma submissão mockada.

Todas as rotas devem ficar organizadas para futura integração com Supabase.

3. Identidade visual Digital Hera

A prioridade máxima desta entrega é a qualidade visual.

Quero aparência de produto premium, sério, moderno e acolhedor, não de formulário genérico ou template administrativo.

Paleta

Hera Purple: #4A2B7A

Purple Hover: #6A3FA8

Deep Purple: #2E1A4D

Purple Wash: #F4F0FA

Purple Soft: #E4D9F5

Background: #FAFAFB

Cards: #FFFFFF

Texto principal: #1A1A2E

Texto secundário: #6B6B6B

Bordas: #EAEAEF

Sucesso: #0F9D66

Alerta: #E0932B

Erro: #D8443C

Regra principal: neutros devem dominar aproximadamente 90% da interface. Roxo é assinatura e destaque, não fundo dominante.

Use roxo nos CTAs, progresso, elementos ativos, links e pequenos detalhes.

Tipografia

Use Inter.

400: corpo

500: labels e botões

600: títulos de seção

700: títulos principais

Estilo

Muito espaço em branco

Cards grandes e elegantes

Border radius aproximadamente 16px

Inputs e botões aproximadamente 10px

Sombras muito suaves

Bordas discretas

Ícones Lucide

Nada multicolorido

Nada com aparência infantil

Nada com excesso de gradientes

Nada com excesso de roxo

Evitar aparência de template pronto

Referência de sensação: Linear, Stripe e Notion, adaptados à identidade da Digital Hera.

Centralize os tokens visuais para facilitar alterações futuras.

4. Onboarding do cliente

Criar um wizard premium, responsivo e com uma etapa por tela.

No topo mostrar:

Logo/nome Digital Hera

e um progresso elegante com:

Empresa

Administrador

Setores

Usuários

Revisão

Etapa 1 — Empresa

Título:

Vamos começar pela sua empresa

Campos:

Nome da empresa*

CNPJ*

WhatsApp*

CEP

Rua

Número

Complemento

Bairro

Cidade

Estado

Aplicar máscara visual para CNPJ, telefone e CEP.

Botões:

Continuar

Etapa 2 — Administrador

Título:

Quem será o administrador?

Campos:

Nome*

Email*

Mostrar um pequeno card informativo:

"O administrador terá acesso total ao sistema e poderá gerenciar usuários e configurações."

Botões:

Voltar
Continuar

Etapa 3 — Setores

Título:

Como sua empresa se organiza?

Permitir adicionar setores dinamicamente.

Campo:

Nome do setor

Botão:

+ Adicionar setor

Cada setor criado aparece em um card/lista elegante com opção de remover.

Exemplos iniciais podem ser usados apenas como placeholder:

Comercial

Financeiro

Suporte

Exigir visualmente pelo menos um setor.

Etapa 4 — Usuários

Título:

Quem vai usar o sistema?

Permitir adicionar pessoas dinamicamente.

Cada pessoa possui:

Nome

Email

Setor

O select de setor deve usar os setores adicionados na etapa anterior, através do estado React.

Botão:

+ Adicionar pessoa

Cada pessoa adicionada deve aparecer de forma organizada e permitir remoção.

Etapa 5 — Revisão

Título:

Confira antes de enviar

Mostrar todos os dados agrupados em cards:

Empresa

Administrador

Setores

Usuários por setor

Criar uma hierarquia de leitura muito elegante.

Botões:

Voltar
Enviar cadastro

Nesta versão o botão não envia para nenhum backend.

Ao clicar, apenas simular o envio e abrir a tela de sucesso.

5. Tela de sucesso

Criar uma tela visualmente marcante, mas elegante.

Mensagem principal:

Cadastro enviado!

Texto:

"A equipe da Digital Hera vai preparar seu ambiente e entrar em contato com você."

Pode usar pequenos detalhes decorativos em roxo claro, orbes suaves ou elementos abstratos discretos.

Nada exagerado.

6. Painel administrativo

O painel é secundário nesta entrega. Priorize primeiro o onboarding.

Criar sidebar desktop elegante usando #2E1A4D.

Menu:

Onboarding

Submissões

Na área superior mostrar:

Onboarding de clientes

Criar lista mockada contendo:

Empresa

Responsável

Data

Status

Status:

Pendente

Revisado

Criado

Exemplo:

JB Auto
João Batista
25/08/2026
Pendente

Empresa Exemplo
Maria Silva
24/08/2026
Revisado

Ao clicar, navegar para:

/admin/submissions/:id

7. Detalhe administrativo

Mostrar os dados usando praticamente a mesma identidade visual da tela de revisão:

Empresa

Administrador

Setores

Usuários por setor

Status

Adicionar visualmente:

Copiar dados

Alterar status

Essas ações podem ser apenas simuladas no front-end.

8. Responsividade

O onboarding deve ser excelente principalmente em celular.

No mobile:

Uma coluna

Campos confortáveis

CTAs grandes

Boa distância entre elementos

Progresso adaptado para telas pequenas

Nada espremido

O painel administrativo pode ser desktop-first, mas deve continuar utilizável em tablet/mobile.

9. Regras importantes

NÃO criar integração com Supabase.

NÃO criar tabelas.

NÃO criar backend.

NÃO criar APIs.

NÃO criar autenticação funcional.

NÃO gastar esforço com infraestrutura.

NÃO adicionar funcionalidades fora deste escopo.

Use dados mockados no painel.

Use React state para funcionamento do formulário.

Organize componentes para futura integração.

Evite código excessivamente complexo.

Priorize acabamento visual e UX.

A maior parte do esforço deve estar no onboarding externo, pois ele será a primeira experiência de um novo cliente com a Digital Hera.

Quero que a primeira tela já transmita imediatamente:

“A Digital Hera possui tecnologia própria, organização e um produto premium.”

Antes de adicionar qualquer funcionalidade extra, garanta que o formulário, sua identidade visual, espaçamentos, tipografia, cards, campos, progresso, responsividade e tela de sucesso estejam visualmente impecáveis.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f60c8e41-0e68-4604-a3c1-2d7319de6343).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
