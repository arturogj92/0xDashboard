const currentTime = new Date().getTime();
console.log('🔄 getAccessToken invocado. Hora actual:', currentTime, 'tokenExpiresAt:', tokenExpiresAt);
if (cachedAccessToken && tokenExpiresAt && currentTime < tokenExpiresAt) {
    console.log('🔁 Token cacheado válido. Devolviendo:', cachedAccessToken);
    return cachedAccessToken;
}

try {
    console.log('↘️ Ejecutando consulta a Supabase para token de Instagram');
    const { data, error } = await supabase
        .from('instagram_tokens')
        .select('access_token')
        .limit(1)
        .single();
    console.log('↩️ Supabase response:', { data, error });
    
    if (error) {
        console.log('❌ Error al obtener token de Supabase:', error);
        return process.env.INSTAGRAM_ACCESS_TOKEN;
    }
    
    if (!data) {
        console.log('⚠️ No se encontró token en la base de datos, fallback a ENV:', process.env.INSTAGRAM_ACCESS_TOKEN);
        return process.env.INSTAGRAM_ACCESS_TOKEN;
    }
    
    cachedAccessToken = data.access_token;
    tokenExpiresAt = currentTime + CACHE_DURATION_MS;
    console.log('✅ Token obtenido de Supabase y cacheado hasta:', tokenExpiresAt);
    return cachedAccessToken;
} catch (err) {
    console.log('❌ Error inesperado al obtener token:', err);
    console.log('🔴 Fallback a ENV:', process.env.INSTAGRAM_ACCESS_TOKEN);
    return process.env.INSTAGRAM_ACCESS_TOKEN;
} 