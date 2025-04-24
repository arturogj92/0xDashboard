import * as supabaseService from '../supabaseService';
const { getGlobalDmStats, executeCount } = supabaseService;

test('debería devolver estadísticas usando executeCount', async () => {
  // Mock executeCount para simular conteos: 28d, 7d, ayer, hoy
  const spy = jest.spyOn(supabaseService, 'executeCount')
    .mockResolvedValueOnce(28)  // last28Total
    .mockResolvedValueOnce(10)  // last7Total
    .mockResolvedValueOnce(15)  // yesterdayTotal
    .mockResolvedValueOnce(5);  // todayTotal

  const stats = await getGlobalDmStats('Europe/Madrid');

  expect(spy).toHaveBeenCalledTimes(4);
  expect(stats).toEqual({
    last_28_days_total: 28,
    last_7_days_total: 10,
    yesterday_total: 15,
    today_total: 5
  });
});

test('manejando errores y devolviendo zeros', async () => {
  jest.spyOn(supabaseService, 'executeCount')
    .mockRejectedValue(new Error('DB error'));

  const stats = await getGlobalDmStats();
  expect(stats).toEqual({
    last_28_days_total: 0,
    last_7_days_total: 0,
    yesterday_total: 0,
    today_total: 0
  });
}); 