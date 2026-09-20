# Testes de frete e senha

Foram lidos public/frete.html, public/frete.js, public/senha.html,
public/senha.js e os exemplos tests/idade.spec.ts e tests/login.spec.ts.
Embora o README mencione spec-gabarito para as atividades, nesta pasta do ZIP
existiam somente idade.spec.ts e login.spec.ts. Os dois novos arquivos seguem
o mesmo padrão: navegação, preenchimento por label, clique por papel/nome e
asserções de visibilidade, texto exato e role (status ou alert).

## Frete: regras e cobertura

O frete depende de CEP e valor do pedido, não de peso.

| Classe ou limite | Entradas | Resultado |
| --- | --- | --- |
| CEP iniciado por 8 | 80000000; pedido 100 | Frete: R$ 15,00 |
| Outro CEP, com zero inicial | 01001000; pedido 100 | Frete: R$ 25,00 |
| Limite inferior do valor | -0,01 / 0 / 0,01 | inválido / inválido / válido |
| Limite da gratuidade, para os dois CEPs | 199,99 / 200,00 / 200,01 | frete pago / grátis / grátis |
| Comprimento do CEP | 7 / 8 / 9 dígitos | inválido / válido / inválido |
| CEP inválido | vazio, só espaços, letra, hífen, espaço interno | Dados inválidos |
| Valor inválido | vazio, só espaços, texto, negativo, zero | Dados inválidos |
| Formato monetário inválido | 100,001; 1.000,00; R$ 100,00; 100,; ,50; 1e2; 1 00 | Dados inválidos |
| Formatos aceitos | inteiro; uma ou duas casas; ponto ou vírgula | frete calculado |
| Espaços externos | CEP e valor com espaços nas pontas | são removidos |
| Pedido de 200 com CEP inválido | 8000000 | Dados inválidos |

As restrições de formato do valor e a remoção de espaços externos estão no
JavaScript. A página informa explicitamente as tarifas, a gratuidade e o
comprimento do CEP. Não há consulta à existência real do CEP.
Também se verifica que o resultado começa oculto e muda corretamente após
erro, correção e novo erro. São 34 testes de frete.

## Senha: regras e cobertura

A senha precisa ter 8 a 20 caracteres, pelo menos uma letra A–Z, uma letra
a–z e um dígito, sem espaços. A confirmação deve ser exatamente igual.
Caractere especial é permitido, mas não obrigatório.

| Classe ou limite | Entradas | Resultado |
| --- | --- | --- |
| Limite mínimo | 7 / 8 / 9 caracteres | rejeita / aceita / aceita |
| Limite máximo | 19 / 20 / 21 caracteres | aceita / aceita / rejeita |
| Válidas | Senha123 e Senha123! | Senha cadastrada |
| Vazia | string vazia | Senha fora do padrão |
| Sem maiúscula | senha123 | Senha fora do padrão |
| Sem minúscula | SENHA123 | Senha fora do padrão |
| Sem número | Senhaabc | Senha fora do padrão |
| Espaço | início, meio e fim | Senha fora do padrão |
| Confirmação inválida, senha válida | diferente, vazia ou diferença só de caixa | As senhas não coincidem |
| Formato inválido e confirmação diferente | abc / diferente | Senha fora do padrão |

Nos testes de tamanho, a senha é construída com Ab1 seguido de letras x:
assim todas as outras regras continuam atendidas. Nos testes de formato,
a confirmação é igual, isolando a regra testada. Após sucesso, os dois
campos devem ficar vazios. Também há um teste de correção da confirmação
após erro. São 20 testes de senha.

## Como usar

Copie tests/frete.spec.ts e tests/senha.spec.ts para a pasta tests do projeto
aulas/SEMANA04/exemplo-playwright. Ou use esta cópia completa do exemplo,
que já contém os dois arquivos. As páginas e as regras não foram alteradas.

No terminal, dentro da pasta exemplo-playwright:

```sh
npm ci
npx playwright install chromium
npx playwright test tests/frete.spec.ts tests/senha.spec.ts --project=chromium
```

Para executar também idade e login nos três navegadores:

```sh
npx playwright install
npx playwright test
```

Para abrir o relatório:

```sh
npx playwright show-report
```

Esses comandos funcionam também no Windows. Os scripts npm originais do
projeto usam atribuição de variável no estilo Linux/macOS, que não funciona
diretamente no terminal padrão do Windows. Os comandos npx acima evitam
essa incompatibilidade. O servidor é iniciado automaticamente pelo Playwright.

Depois de conferir a execução, publique seu projeto no GitHub conforme o
enunciado. Não inclua node_modules, navegadores baixados, test-results ou
playwright-report no repositório.

## Verificação realizada

Executado com Playwright 1.62.1 em 20/09/2026, com quatro workers:
- Chromium: 65/65 aprovados.
- WebKit: 65/65 aprovados.
- Firefox: 64/65 aprovados na primeira execução; um timeout de 30 segundos
  ao preencher o valor do pedido no caso de CEP 80000000 com 199,99.
- O caso do Firefox foi repetido isoladamente três vezes, com um worker:
  3/3 aprovados, sem alterações no teste ou na aplicação. A falha não se
  reproduziu; isso sugere instabilidade de execução, mas não prova a causa.

Total: 54 testes novos (34 frete e 20 senha) e 11 originais.
