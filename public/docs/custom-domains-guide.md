# Guía de Dominios Personalizados - Creator0x

## ¿Qué son los dominios personalizados?

Los dominios personalizados te permiten usar tu propia URL (como `midominio.com`) para mostrar tu landing page de Creator0x, en lugar de usar `tuusuario.creator0x.com`.

## Beneficios

- ✅ **Profesionalismo**: Usa tu propia marca y dominio
- ✅ **SEO**: Mejor posicionamiento con tu dominio
- ✅ **Confianza**: Los usuarios confían más en dominios propios
- ✅ **Flexibilidad**: Mantén control total de tu presencia online

## Requisitos

1. **Tener un dominio registrado** (ej: midominio.com)
2. **Acceso al panel de control DNS** de tu proveedor de dominios
3. **Cuenta activa en Creator0x**

## Paso a Paso

### 1. Agregar tu dominio en Creator0x

1. Ve al **Editor** de tu landing page
2. Abre la sección **"Personaliza el Estilo"**
3. Busca **"Dominio Personalizado"**
4. Ingresa tu dominio (ej: `midominio.com`)
5. Haz clic en **"Agregar Dominio"**

### 2. Configurar DNS

Después de agregar tu dominio, verás las instrucciones específicas para configurar DNS. Necesitarás agregar uno de estos registros:

#### Opción A: Registro TXT (Recomendado)
```
Tipo: TXT
Nombre: _creator0x-verification
Valor: [token único que te proporcionamos]
```

#### Opción B: Registro CNAME (Para subdominios)
```
Tipo: CNAME
Nombre: @ (o tu subdominio)
Valor: vps.creator0x.com
```

### 3. Configuración por Proveedor

#### GoDaddy
1. Inicia sesión en GoDaddy
2. Ve a **"My Products"** → **"DNS"**
3. Busca **"Records"**
4. Agrega el registro TXT o CNAME
5. Guarda los cambios

#### Namecheap
1. Inicia sesión en Namecheap
2. Ve a **"Domain List"** → **"Manage"**
3. Busca **"Advanced DNS"**
4. Agrega el registro TXT o CNAME
5. Guarda los cambios

#### Cloudflare
1. Inicia sesión en Cloudflare
2. Selecciona tu dominio
3. Ve a **"DNS"** → **"Records"**
4. Agrega el registro TXT o CNAME
5. Asegúrate de que esté en modo **"DNS only"** (nube gris)

#### Google Domains
1. Inicia sesión en Google Domains
2. Selecciona tu dominio
3. Ve a **"DNS"**
4. Busca **"Custom resource records"**
5. Agrega el registro TXT o CNAME

### 4. Verificación

1. Espera **24-48 horas** para que se propague el DNS
2. Regresa a Creator0x
3. Haz clic en **"Verificar"** junto a tu dominio
4. Si todo está correcto, el sistema generará automáticamente un certificado SSL

### 5. ¡Listo!

Una vez verificado y con SSL activo:
- ✅ Tu dominio mostrará tu landing page
- ✅ Tendrás HTTPS automático
- ✅ Todo funcionará perfectamente

## Estados del Dominio

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | Esperando configuración DNS |
| **DNS Configurado** | DNS correcto, generando SSL |
| **Activo** | ¡Todo funcionando! |
| **Error** | Problema en la configuración |

## Problemas Comunes

### El dominio no verifica
- **Solución**: Verifica que el registro DNS esté correcto
- **Tiempo**: Puede tomar hasta 48 horas en propagarse
- **Herramienta**: Usa [whatsmydns.net](https://whatsmydns.net) para verificar propagación

### Error de SSL
- **Causa**: El DNS no está propagado completamente
- **Solución**: Espera unas horas más y vuelve a verificar

### El dominio no carga
- **Verifica**: Que el registro CNAME apunte a `vps.creator0x.com`
- **Cache**: Limpia el cache de tu navegador

## Limitaciones

- ⚠️ **Un dominio por landing**: Cada dominio puede conectarse a una sola landing
- ⚠️ **Dominios propios**: Solo dominios que te pertenezcan
- ⚠️ **Subdominios creator0x**: No puedes usar subdominios de creator0x.com

## Renovación SSL

- 🔄 **Automática**: Los certificados SSL se renuevan automáticamente
- ⏰ **Duración**: Certificados válidos por 90 días
- 🔔 **Notificaciones**: Te avisaremos si hay problemas

## Precios

- 💰 **Gratis**: La conexión de dominios personalizados es gratuita
- 💡 **Solo necesitas**: Tu propio dominio registrado

## Soporte

¿Necesitas ayuda? Contáctanos:

- 📧 **Email**: support@creator0x.com
- 💬 **Chat**: Disponible en la plataforma
- 📚 **Documentación**: Esta guía y más en nuestro centro de ayuda

---

## Comandos DNS para Verificación

Si eres técnico, puedes verificar la configuración manualmente:

```bash
# Verificar registro TXT
dig TXT _creator0x-verification.tudominio.com

# Verificar registro CNAME
dig CNAME tudominio.com

# Verificar propagación DNS
nslookup tudominio.com 8.8.8.8
```

---

*¿Te fue útil esta guía? ¡Déjanos saber cómo podemos mejorarla!*