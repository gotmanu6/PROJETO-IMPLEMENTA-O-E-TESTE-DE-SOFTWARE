import { test, expect } from '@playwright/test';

const casos = [
  // Ab1 fornece maiúscula, minúscula e número em todos os casos de tamanho.
  ...[7, 8, 9, 19, 20, 21].map(tamanho => ({
    classe: `limite de tamanho: ${tamanho} caracteres`,
    senha: 'Ab1' + 'x'.repeat(tamanho - 3),
    aceito: tamanho >= 8 && tamanho <= 20,
  })),
  { classe: 'válida sem especial (opcional)', senha: 'Senha123', aceito: true },
  { classe: 'válida com especial', senha: 'Senha123!', aceito: true },
  { classe: 'vazia', senha: '', aceito: false },
  { classe: 'sem maiúscula', senha: 'senha123', aceito: false },
  { classe: 'sem minúscula', senha: 'SENHA123', aceito: false },
  { classe: 'sem número', senha: 'Senhaabc', aceito: false },
  { classe: 'espaço no meio', senha: 'Senha 123', aceito: false },
  { classe: 'espaço no início', senha: ' Senha123', aceito: false },
  { classe: 'espaço no fim', senha: 'Senha123 ', aceito: false },
];

test.describe('Cadastro de senha', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/senha'); });

  for (const caso of casos) {
    test(caso.classe, async ({ page }) => {
      const senha = page.getByLabel('Nova senha', { exact: true });
      const confirmacao = page.getByLabel('Confirmar senha', { exact: true });
      await senha.fill(caso.senha);
      // Confirmação igual isola a validação de formato.
      await confirmacao.fill(caso.senha);
      await page.getByRole('button', { name: 'Cadastrar senha' }).click();
      const resultado = page.locator('#resultado');
      await expect(resultado).toBeVisible();
      await expect(resultado).toHaveText(caso.aceito ? 'Senha cadastrada' : 'Senha fora do padrão');
      await expect(resultado).toHaveAttribute('role', caso.aceito ? 'status' : 'alert');
      if (caso.aceito) {
        await expect(senha).toHaveValue('');
        await expect(confirmacao).toHaveValue('');
      }
    });
  }

  for (const caso of [
    { classe: 'confirmação diferente', confirmacao: 'Senha124' },
    { classe: 'confirmação vazia', confirmacao: '' },
    { classe: 'confirmação difere só na caixa', confirmacao: 'senha123' },
  ]) {
    test(caso.classe, async ({ page }) => {
      await page.getByLabel('Nova senha', { exact: true }).fill('Senha123');
      await page.getByLabel('Confirmar senha', { exact: true }).fill(caso.confirmacao);
      await page.getByRole('button', { name: 'Cadastrar senha' }).click();
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByRole('alert')).toHaveText('As senhas não coincidem');
    });
  }

  test('valida formato antes de comparar a confirmação', async ({ page }) => {
    await page.getByLabel('Nova senha', { exact: true }).fill('abc');
    await page.getByLabel('Confirmar senha', { exact: true }).fill('diferente');
    await page.getByRole('button', { name: 'Cadastrar senha' }).click();
    await expect(page.getByRole('alert')).toHaveText('Senha fora do padrão');
  });

  test('permite corrigir a confirmação após um erro', async ({ page }) => {
    await expect(page.locator('#resultado')).toBeHidden();
    await page.getByLabel('Nova senha', { exact: true }).fill('Senha123');
    await page.getByRole('button', { name: 'Cadastrar senha' }).click();
    await expect(page.getByRole('alert')).toHaveText('As senhas não coincidem');
    await page.getByLabel('Confirmar senha', { exact: true }).fill('Senha123');
    await page.getByRole('button', { name: 'Cadastrar senha' }).click();
    await expect(page.getByRole('status')).toHaveText('Senha cadastrada');
    await expect(page.getByLabel('Nova senha', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('Confirmar senha', { exact: true })).toHaveValue('');
  });
});
