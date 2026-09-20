import { test, expect } from '@playwright/test';

// Cada entrada varia uma classe ou um limite; os demais campos ficam válidos.
const validos = [
  { classe: 'CEP iniciado por 8', cep: '80000000', valor: '100', esperado: 'Frete: R$ 15,00' },
  { classe: 'demais CEPs, inclusive zero inicial', cep: '01001000', valor: '100', esperado: 'Frete: R$ 25,00' },
  { classe: 'menor valor positivo em centavos', cep: '80000000', valor: '0,01', esperado: 'Frete: R$ 15,00' },
  { classe: 'decimal com ponto', cep: '01001000', valor: '100.50', esperado: 'Frete: R$ 25,00' },
  { classe: 'uma casa decimal', cep: '80000000', valor: '100,5', esperado: 'Frete: R$ 15,00' },
  { classe: 'espaços externos são removidos', cep: ' 80000000 ', valor: ' 100,00 ', esperado: 'Frete: R$ 15,00' },
  ...['80000000', '01001000'].flatMap(cep => [
    { classe: `abaixo da gratuidade, CEP ${cep}`, cep, valor: '199,99', esperado: cep.startsWith('8') ? 'Frete: R$ 15,00' : 'Frete: R$ 25,00' },
    { classe: `limite da gratuidade, CEP ${cep}`, cep, valor: '200,00', esperado: 'Frete grátis' },
    { classe: `acima da gratuidade, CEP ${cep}`, cep, valor: '200,01', esperado: 'Frete grátis' },
  ]),
];

const invalidos = [
  ...[
    ['CEP vazio', ''],
    ['CEP só com espaços', '   '],
    ['CEP com 7 dígitos', '8000000'],
    ['CEP com 9 dígitos', '800000000'],
    ['CEP com letra e comprimento 8', '8000000A'],
    ['CEP com hífen', '80000-000'],
    ['CEP com espaço interno', '8000 000'],
  ].map(([classe, cep]) => ({ classe, cep, valor: '100' })),
  ...[
    ['valor vazio', ''],
    ['valor só com espaços', '   '],
    ['valor zero', '0'],
    ['zero com casas decimais', '0,00'],
    ['abaixo de zero', '-0,01'],
    ['valor textual', 'cem'],
    ['três casas decimais', '100,001'],
    ['separador de milhar', '1.000,00'],
    ['símbolo monetário', 'R$ 100,00'],
    ['separador sem fração', '100,'],
    ['fração sem parte inteira', ',50'],
    ['notação científica', '1e2'],
    ['espaço interno no valor', '1 00'],
  ].map(([classe, valor]) => ({ classe, cep: '80000000', valor })),
  { classe: 'CEP inválido mesmo com frete grátis', cep: '8000000', valor: '200,00' },
];

test.describe('Cálculo de frete', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/frete'); });

  for (const caso of [
    ...validos.map(c => ({ ...c, aceito: true })),
    ...invalidos.map(c => ({ ...c, esperado: 'Dados inválidos', aceito: false })),
  ]) {
    test(caso.classe, async ({ page }) => {
      await page.getByLabel('CEP', { exact: true }).fill(caso.cep);
      await page.getByLabel('Valor do pedido').fill(caso.valor);
      await page.getByRole('button', { name: 'Calcular frete', exact: true }).click();
      const resultado = page.locator('#resultado');
      await expect(resultado).toBeVisible();
      await expect(resultado).toHaveText(caso.esperado);
      await expect(resultado).toHaveAttribute('role', caso.aceito ? 'status' : 'alert');
    });
  }

  test('atualiza o resultado após erro, correção e novo erro', async ({ page }) => {
    await expect(page.locator('#resultado')).toBeHidden();
    await page.getByRole('button', { name: 'Calcular frete' }).click();
    await expect(page.getByRole('alert')).toHaveText('Dados inválidos');
    await page.getByLabel('CEP', { exact: true }).fill('80000000');
    await page.getByLabel('Valor do pedido').fill('200');
    await page.getByRole('button', { name: 'Calcular frete' }).click();
    await expect(page.getByRole('status')).toHaveText('Frete grátis');
    await page.getByLabel('Valor do pedido').fill('0');
    await page.getByRole('button', { name: 'Calcular frete' }).click();
    await expect(page.getByRole('alert')).toHaveText('Dados inválidos');
  });
});
