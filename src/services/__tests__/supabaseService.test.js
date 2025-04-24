test('debería devolver estadísticas usando executeCount', async () => {
  // Mock executeCount para simular conteos
  const spy = jest.spyOn(require('../supabaseService'), 'executeCount')
    .mockResolvedValueOnce(100) // allTimeTotal
    .mockResolvedValueOnce(10)  // last7Total
    .mockResolvedValueOnce(28)  // last28Total
    .mockResolvedValueOnce(15)  // yesterdayTotal
    .mockResolvedValueOnce(5);  // todayTotal

  const stats = await getGlobalDmStats('Europe/Madrid');

  expect(spy).toHaveBeenCalledTimes(5);
  expect(stats).toEqual({
    all_time_total: 100,
    yesterday_total: 15,
    last_7_days_total: 10,
    last_28_days_total: 28,
    today_total: 5
  });
});

test('manejando errores y devolviendo zeros', async () => {
  jest.spyOn(require('../supabaseService'), 'executeCount')
    .mockRejectedValue(new Error('DB error'));

  const stats = await getGlobalDmStats();
  expect(stats).toEqual({
    today_total: 0,
    yesterday_total: 0,
    last_7_days_total: 0,
    last_28_days_total: 0,
    all_time_total: 0
  });
}); 